export interface Feedback {
  id: string;
  user_id: string;
  message: string;
  status: 'pending' | 'resolved';
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface FeedbackCreateDTO {
  message: string;
}

export interface FeedbackUpdateDTO {
  status?: 'pending' | 'resolved';
  resolved_by?: string;
}

export interface FeedbackStats {
  total_pending: number;
  total_resolved: number;
} 