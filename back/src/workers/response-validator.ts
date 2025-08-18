import { PostgresCacheService } from '../services/cache/postgres-cache.service';

// Configuración de validación
interface ValidationConfig {
  enableValidation: boolean;
  strictMode: boolean;
  cacheValidationResults: boolean;
  validationTTL: number;
  qualityThreshold: number; // 0-1, umbral de calidad mínima
}

// Resultado de validación
interface ValidationResult {
  isValid: boolean;
  quality: number; // 0-1, puntuación de calidad
  issues: ValidationIssue[];
  warnings: string[];
  suggestions: string[];
}

// Problema de validación
interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Regla de validación
interface ValidationRule {
  name: string;
  field: string;
  type: 'required' | 'type' | 'range' | 'format' | 'custom';
  validator: (value: any, context?: any) => boolean;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  weight: number; // Peso para calcular calidad
}

// Contexto de validación
interface ValidationContext {
  platform?: string;
  postId?: string;
  expectedFields?: string[];
  minQuality?: number;
}

export class ResponseValidator {
  private static instance: ResponseValidator;
  private config: ValidationConfig;
  private validationRules = new Map<string, ValidationRule[]>();
  private validationCache = new Map<string, ValidationResult>();
  private cacheService = PostgresCacheService.getInstance();

  private constructor() {
    this.config = {
      enableValidation: true,
      strictMode: false,
      cacheValidationResults: true,
      validationTTL: 1800, // 30 minutos
      qualityThreshold: 0.7
    };

    this.initializeDefaultRules();
  }

  static getInstance(): ResponseValidator {
    if (!ResponseValidator.instance) {
      ResponseValidator.instance = new ResponseValidator();
    }
    return ResponseValidator.instance;
  }

  // Inicializar reglas por defecto
  private initializeDefaultRules(): void {
    // Reglas para métricas de posts
    this.addValidationRules('metrics', [
      {
        name: 'required_fields',
        field: 'root',
        type: 'required',
        validator: (data: any) => {
          return data && typeof data === 'object' && 
                 data.likes !== undefined && 
                 data.views !== undefined;
        },
        message: 'Missing required fields: likes, views',
        severity: 'critical',
        weight: 1.0
      },
      {
        name: 'numeric_values',
        field: 'metrics',
        type: 'type',
        validator: (data: any) => {
          return typeof data.likes === 'number' && 
                 typeof data.views === 'number' &&
                 data.likes >= 0 && 
                 data.views >= 0;
        },
        message: 'Likes and views must be non-negative numbers',
        severity: 'high',
        weight: 0.8
      },
      {
        name: 'reasonable_values',
        field: 'metrics',
        type: 'range',
        validator: (data: any) => {
          return data.views >= data.likes && 
                 data.views <= 1000000000; // 1B máximo
        },
        message: 'Views should be >= likes and <= 1B',
        severity: 'medium',
        weight: 0.6
      }
    ]);

    // Reglas para comentarios
    this.addValidationRules('comments', [
      {
        name: 'comments_array',
        field: 'root',
        type: 'required',
        validator: (data: any) => {
          return Array.isArray(data) && data.length > 0;
        },
        message: 'Comments must be a non-empty array',
        severity: 'critical',
        weight: 1.0
      },
      {
        name: 'comment_structure',
        field: 'comments',
        type: 'custom',
        validator: (data: any) => {
          return data.every((comment: any) => 
            comment && 
            typeof comment.text === 'string' && 
            comment.text.trim().length > 0
          );
        },
        message: 'Each comment must have valid text',
        severity: 'high',
        weight: 0.9
      },
      {
        name: 'comment_quality',
        field: 'comments',
        type: 'custom',
        validator: (data: any) => {
          const validComments = data.filter((comment: any) => 
            comment.text && 
            comment.text.trim().length >= 3 && 
            comment.text.trim().length <= 1000
          );
          return validComments.length >= data.length * 0.8; // 80% deben ser válidos
        },
        message: 'At least 80% of comments should have reasonable length',
        severity: 'medium',
        weight: 0.7
      }
    ]);

    // Reglas para sentimientos
    this.addValidationRules('sentiment', [
      {
        name: 'sentiment_structure',
        field: 'root',
        type: 'required',
        validator: (data: any) => {
          return data && 
                 typeof data.label === 'string' && 
                 typeof data.score === 'number';
        },
        message: 'Sentiment must have label and score',
        severity: 'critical',
        weight: 1.0
      },
      {
        name: 'valid_label',
        field: 'sentiment',
        type: 'format',
        validator: (data: any) => {
          const validLabels = ['positive', 'negative', 'neutral'];
          return validLabels.includes(data.label);
        },
        message: 'Sentiment label must be positive, negative, or neutral',
        severity: 'high',
        weight: 0.9
      },
      {
        name: 'score_range',
        field: 'sentiment',
        type: 'range',
        validator: (data: any) => {
          return data.score >= 0 && data.score <= 1;
        },
        message: 'Sentiment score must be between 0 and 1',
        severity: 'high',
        weight: 0.8
      }
    ]);
  }

  // Agregar reglas de validación
  addValidationRules(type: string, rules: ValidationRule[]): void {
    const existingRules = this.validationRules.get(type) || [];
    this.validationRules.set(type, [...existingRules, ...rules]);
  }

  // Validar respuesta
  async validateResponse<T>(
    data: T,
    type: string,
    context?: ValidationContext
  ): Promise<ValidationResult> {
    if (!this.config.enableValidation) {
      return {
        isValid: true,
        quality: 1.0,
        issues: [],
        warnings: [],
        suggestions: []
      };
    }

    // Verificar cache
    const cacheKey = this.generateCacheKey(data, type, context);
    if (this.config.cacheValidationResults) {
      const cached = await this.getCachedValidation(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const rules = this.validationRules.get(type) || [];
    const issues: ValidationIssue[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    let totalWeight = 0;
    let passedWeight = 0;

    // Ejecutar reglas de validación
    for (const rule of rules) {
      totalWeight += rule.weight;
      
      try {
        const isValid = rule.validator(data, context);
        
        if (isValid) {
          passedWeight += rule.weight;
        } else {
          issues.push({
            type: rule.severity === 'critical' ? 'error' : 'warning',
            field: rule.field,
            message: rule.message,
            severity: rule.severity
          });

          if (rule.severity === 'critical') {
            warnings.push(`Critical validation failed: ${rule.message}`);
          }
        }
      } catch (error) {
        issues.push({
          type: 'error',
          field: rule.field,
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'high'
        });
      }
    }

    // Calcular calidad
    const quality = totalWeight > 0 ? passedWeight / totalWeight : 0;
    const isValid = quality >= this.config.qualityThreshold;

    // Generar sugerencias
    if (quality < 0.5) {
      suggestions.push('Data quality is very low. Consider retrying or using fallback data.');
    } else if (quality < 0.8) {
      suggestions.push('Data quality could be improved. Review validation issues.');
    }

    if (issues.length > 0) {
      suggestions.push(`Found ${issues.length} validation issues. Review and fix if necessary.`);
    }

    const result: ValidationResult = {
      isValid,
      quality,
      issues,
      warnings,
      suggestions
    };

    // Cachear resultado
    if (this.config.cacheValidationResults) {
      await this.cacheValidation(cacheKey, result);
    }

    return result;
  }

  // Validar múltiples respuestas
  async validateBatch<T>(
    dataArray: T[],
    type: string,
    context?: ValidationContext
  ): Promise<{
    results: ValidationResult[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
      avgQuality: number;
      criticalIssues: number;
    };
  }> {
    const results = await Promise.all(
      dataArray.map(data => this.validateResponse(data, type, context))
    );

    const valid = results.filter(r => r.isValid).length;
    const avgQuality = results.reduce((sum, r) => sum + r.quality, 0) / results.length;
    const criticalIssues = results.reduce((sum, r) => 
      sum + r.issues.filter(i => i.severity === 'critical').length, 0
    );

    return {
      results,
      summary: {
        total: dataArray.length,
        valid,
        invalid: dataArray.length - valid,
        avgQuality,
        criticalIssues
      }
    };
  }

  // Generar clave de cache
  private generateCacheKey(data: any, type: string, context?: ValidationContext): string {
    const dataHash = JSON.stringify(data).slice(0, 100); // Primeros 100 caracteres
    const contextHash = context ? JSON.stringify(context) : '';
    return `validation:${type}:${Buffer.from(dataHash + contextHash).toString('base64').slice(0, 20)}`;
  }

  // Obtener validación cacheada
  private async getCachedValidation(cacheKey: string): Promise<ValidationResult | null> {
    try {
      const cached = await this.cacheService.get<ValidationResult>(cacheKey);
      return cached ? cached : null;
    } catch (error) {
      console.warn(`⚠️ [VALIDATOR] Error getting cached validation:`, error);
      return null;
    }
  }

  // Cachear validación
  private async cacheValidation(cacheKey: string, result: ValidationResult): Promise<void> {
    try {
      await this.cacheService.set(cacheKey, result, this.config.validationTTL);
    } catch (error) {
      console.warn(`⚠️ [VALIDATOR] Error caching validation:`, error);
    }
  }

  // Validar estructura de datos específica
  validateDataStructure(data: any, expectedFields: string[]): ValidationResult {
    const issues: ValidationIssue[] = [];
    const missingFields: string[] = [];

    for (const field of expectedFields) {
      if (!(field in data)) {
        missingFields.push(field);
        issues.push({
          type: 'error',
          field,
          message: `Missing required field: ${field}`,
          severity: 'critical'
        });
      }
    }

    const quality = missingFields.length === 0 ? 1.0 : 
      Math.max(0, 1 - (missingFields.length / expectedFields.length));

    return {
      isValid: missingFields.length === 0,
      quality,
      issues,
      warnings: missingFields.length > 0 ? [`Missing fields: ${missingFields.join(', ')}`] : [],
      suggestions: missingFields.length > 0 ? ['Add missing required fields'] : []
    };
  }

  // Validar calidad de texto
  validateTextQuality(text: string, minLength: number = 3, maxLength: number = 1000): ValidationResult {
    const issues: ValidationIssue[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!text || typeof text !== 'string') {
      issues.push({
        type: 'error',
        field: 'text',
        message: 'Text must be a non-empty string',
        severity: 'critical'
      });
      return {
        isValid: false,
        quality: 0,
        issues,
        warnings,
        suggestions
      };
    }

    const trimmedText = text.trim();
    let quality = 1.0;

    if (trimmedText.length < minLength) {
      issues.push({
        type: 'warning',
        field: 'text',
        message: `Text too short (${trimmedText.length} chars, minimum ${minLength})`,
        severity: 'medium'
      });
      quality -= 0.3;
    }

    if (trimmedText.length > maxLength) {
      issues.push({
        type: 'warning',
        field: 'text',
        message: `Text too long (${trimmedText.length} chars, maximum ${maxLength})`,
        severity: 'medium'
      });
      quality -= 0.2;
    }

    // Detectar spam o contenido de baja calidad
    const spamIndicators = ['buy now', 'click here', 'free money', 'make money fast'];
    const hasSpam = spamIndicators.some(indicator => 
      trimmedText.toLowerCase().includes(indicator)
    );

    if (hasSpam) {
      issues.push({
        type: 'warning',
        field: 'text',
        message: 'Text contains potential spam indicators',
        severity: 'medium'
      });
      quality -= 0.4;
      suggestions.push('Review text for spam content');
    }

    return {
      isValid: quality >= 0.5,
      quality: Math.max(0, quality),
      issues,
      warnings,
      suggestions
    };
  }

  // Actualizar configuración
  updateConfig(updates: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Limpiar cache
  async clearCache(): Promise<void> {
    try {
      // No hay implementación para limpiar cache en PostgresCacheService
      // Esto podría necesitar ser manejado por el servicio de caché si implementa métodos de limpieza
      console.warn(`⚠️ [VALIDATOR] clearCache is not implemented for PostgresCacheService. No action taken.`);
    } catch (error) {
      console.error(`❌ [VALIDATOR] Error clearing cache:`, error);
    }
  }

  // Obtener estadísticas
  getStats(): {
    totalRules: number;
    ruleTypes: Record<string, number>;
    cacheSize: number;
  } {
    const totalRules = Array.from(this.validationRules.values())
      .reduce((sum, rules) => sum + rules.length, 0);
    
    const ruleTypes: Record<string, number> = {};
    for (const rules of this.validationRules.values()) {
      for (const rule of rules) {
        ruleTypes[rule.type] = (ruleTypes[rule.type] || 0) + 1;
      }
    }

    return {
      totalRules,
      ruleTypes,
      cacheSize: this.validationCache.size
    };
  }
} 