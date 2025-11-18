import * as XLSX from 'xlsx';
import { CampaignSchedule } from '../../models/campaign/campaign-schedule.model';

interface ExcelRow {
  Título?: string;
  Fecha?: string;
  Influencer?: string;
  Plataforma?: string;
  'Tipo de Contenido'?: string;
  Descripción?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export interface ParsedScheduleItem {
  row: number;
  data: Partial<CampaignSchedule>;
  isValid: boolean;
  errors: ValidationError[];
}

interface Influencer {
  id: string;
  name: string;
  handle?: string;
  avatar?: string;
}

export class ExcelParserService {
  private static PLATFORM_MAP: Record<string, CampaignSchedule['platform']> = {
    'instagram': 'instagram',
    'youtube': 'youtube',
    'tiktok': 'tiktok',
    'twitter': 'twitter',
    'facebook': 'facebook'
  };

  private static CONTENT_TYPE_BY_PLATFORM: Record<string, string[]> = {
    'instagram': ['post', 'reel', 'story', 'carrusel'],
    'youtube': ['video', 'short'],
    'tiktok': ['video'],
    'twitter': ['post'],
    'facebook': ['post']
  };

  /**
   * Parse Excel file buffer and validate against campaign influencers
   */
  static parseExcel(
    fileBuffer: Buffer,
    campaignInfluencers: Influencer[]
  ): ParsedScheduleItem[] {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    const results: ParsedScheduleItem[] = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because row 1 is header and index starts at 0
      const errors: ValidationError[] = [];
      const data: Partial<CampaignSchedule> = {};

      // Validate and parse Title
      if (!row.Título || row.Título.trim() === '') {
        errors.push({ field: 'Título', message: 'El título es obligatorio' });
      } else {
        data.title = row.Título.trim();
      }

      // Validate and parse Date
      if (!row.Fecha) {
        errors.push({ field: 'Fecha', message: 'La fecha es obligatoria' });
      } else {
        const parsedDate = this.parseDate(row.Fecha);
        if (!parsedDate) {
          errors.push({ field: 'Fecha', message: 'Formato de fecha inválido. Use DD/MM/YYYY o DD-MM-YYYY' });
        } else {
          data.start_date = parsedDate;
          data.end_date = parsedDate;
        }
      }

      // Validate and parse Influencer
      if (!row.Influencer || row.Influencer.trim() === '') {
        errors.push({ field: 'Influencer', message: 'El influencer es obligatorio' });
      } else {
        const influencer = this.findInfluencer(row.Influencer.trim(), campaignInfluencers);
        if (!influencer) {
          errors.push({
            field: 'Influencer',
            message: `Influencer "${row.Influencer}" no encontrado en la campaña`
          });
        } else {
          data.influencer_id = influencer.id;
          data.influencer_name = influencer.name;
          data.influencer_handle = influencer.handle;
          data.influencer_avatar = influencer.avatar;
        }
      }

      // Validate and parse Platform
      if (!row.Plataforma || row.Plataforma.trim() === '') {
        errors.push({ field: 'Plataforma', message: 'La plataforma es obligatoria' });
      } else {
        const platform = this.parsePlatform(row.Plataforma.trim());
        if (!platform) {
          errors.push({
            field: 'Plataforma',
            message: `Plataforma inválida. Use: Instagram, YouTube, TikTok, Twitter, o Facebook`
          });
        } else {
          data.platform = platform;
        }
      }

      // Validate and parse Content Type
      if (!row['Tipo de Contenido'] || row['Tipo de Contenido'].trim() === '') {
        errors.push({ field: 'Tipo de Contenido', message: 'El tipo de contenido es obligatorio' });
      } else {
        const contentType = this.parseContentType(
          row['Tipo de Contenido'].trim(),
          data.platform
        );
        if (!contentType) {
          const allowedTypes = data.platform
            ? this.CONTENT_TYPE_BY_PLATFORM[data.platform]?.join(', ')
            : 'N/A';
          errors.push({
            field: 'Tipo de Contenido',
            message: `Tipo de contenido inválido para ${data.platform || 'la plataforma'}. Use: ${allowedTypes}`
          });
        } else {
          data.content_type = contentType as CampaignSchedule['content_type'];
        }
      }

      // Parse Description (optional)
      if (row.Descripción && row.Descripción.trim() !== '') {
        data.description = row.Descripción.trim();
      }

      // Set default values
      data.status = 'pending';
      data.objectives = [];
      data.metrics = {};
      data.assigned_budget = 0;
      data.actual_cost = 0;

      results.push({
        row: rowNumber,
        data,
        isValid: errors.length === 0,
        errors
      });
    });

    return results;
  }

  /**
   * Parse date string to Date object
   * Supports: DD/MM/YYYY, DD-MM-YYYY, and Excel serial dates
   */
  private static parseDate(dateValue: any): Date | null {
    try {
      // Handle Excel serial dates
      if (typeof dateValue === 'number') {
        const excelDate = XLSX.SSF.parse_date_code(dateValue);
        return new Date(excelDate.y, excelDate.m - 1, excelDate.d);
      }

      // Handle string dates
      if (typeof dateValue === 'string') {
        const dateStr = dateValue.trim();

        // Try DD/MM/YYYY or DD-MM-YYYY
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const year = parseInt(parts[2], 10);

          const date = new Date(year, month, day);

          // Validate the date is valid
          if (
            date.getDate() === day &&
            date.getMonth() === month &&
            date.getFullYear() === year
          ) {
            return date;
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find influencer by name (case-insensitive)
   */
  private static findInfluencer(
    name: string,
    influencers: Influencer[]
  ): Influencer | null {
    const normalizedName = name.toLowerCase().trim();
    return influencers.find(
      inf => inf.name.toLowerCase().trim() === normalizedName
    ) || null;
  }

  /**
   * Parse platform string to valid platform value
   */
  private static parsePlatform(platform: string): CampaignSchedule['platform'] | null {
    const normalized = platform.toLowerCase().trim();
    return this.PLATFORM_MAP[normalized] || null;
  }

  /**
   * Parse content type based on platform
   */
  private static parseContentType(
    contentType: string,
    platform?: CampaignSchedule['platform']
  ): string | null {
    if (!platform) return null;

    const normalized = contentType.toLowerCase().trim();
    const allowedTypes = this.CONTENT_TYPE_BY_PLATFORM[platform] || [];

    return allowedTypes.includes(normalized) ? normalized : null;
  }

  /**
   * Get summary statistics from parsed results
   */
  static getSummary(results: ParsedScheduleItem[]) {
    const valid = results.filter(r => r.isValid).length;
    const invalid = results.filter(r => !r.isValid).length;
    const total = results.length;

    return {
      total,
      valid,
      invalid,
      validPercentage: total > 0 ? Math.round((valid / total) * 100) : 0
    };
  }
}
