// Auto-scaler desactivado temporalmente durante migración a PostgreSQL
// TODO: Reimplementar usando PostgreSQL si es necesario

export class WorkerAutoScaler {
  private static instance: WorkerAutoScaler;
  private isEnabled = false; // Desactivado temporalmente

  static getInstance(): WorkerAutoScaler {
    if (!WorkerAutoScaler.instance) {
      WorkerAutoScaler.instance = new WorkerAutoScaler();
    }
    return WorkerAutoScaler.instance;
  }

  private constructor() {
  }

  // Métodos no operativos
  async start(): Promise<void> {
  }

  async stop(): Promise<void> {
  }

  getStatus(): any {
    return { enabled: false, reason: 'Migración a PostgreSQL en progreso' };
  }
} 