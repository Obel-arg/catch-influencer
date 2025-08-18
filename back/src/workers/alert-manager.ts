// Alert Manager desactivado temporalmente durante migración a PostgreSQL
// TODO: Reimplementar usando PostgreSQL si es necesario

export class AlertManager {
  private static instance: AlertManager;
  private isEnabled = false; // Desactivado temporalmente

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  private constructor() {
  }

  // Métodos no operativos
  evaluateData(key: string, data: any, tags?: string[]): void {
  }

  updateConfig(config: any): void {
  }

  getAlertMetrics(): any {
    return { enabled: false, reason: 'Migración a PostgreSQL en progreso' };
  }
} 