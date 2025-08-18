export interface WorkerStatus {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'unknown' | 'restarting';
  processed: number;
  failed: number;
  successRate: number;
  lastActivity: string;
  queueSize: number;
  isInfiniteLoop: boolean;
  lastRestart?: string;
}

export interface ControlMessage {
  type: 'success' | 'error';
  message: string;
}

export interface QueueStats {
  total: number;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

export interface JobData {
  postId?: string;
  postUrl?: string;
  platform?: string;
  influencerId?: string;
  campaignId?: string;
  estimatedDuration?: string;
  priorityLevel?: 'Alta' | 'Media' | 'Baja';
}

export interface QueueJob {
  id: string;
  name: string;
  data: any;
  timestamp: number;
  attemptsMade: number;
  state: string;
  progress: number;
  delay: number;
  priority: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  stacktrace?: string;
  jobData: JobData;
}

export interface CompletedJob {
  id: string;
  name: string;
  data: any;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  returnvalue?: any;
}

export interface FailedJob {
  id: string;
  name: string;
  data: any;
  timestamp: number;
  processedOn?: number;
  failedReason: string;
  attemptsMade: number;
}

export interface WorkerLog {
  timestamp: string;
  level: 'info' | 'error' | 'success' | 'warn';
  message: string;
  data?: any;
}

export type JobAction = 'pause' | 'resume' | 'remove' | 'retry' | 'promote' | 'force-terminate' | 'restart';

export type WorkerAction = 'start' | 'stop' | 'restart' | 'force-init'; 