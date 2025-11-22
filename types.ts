
export interface StableHordeModel {
  name: string;
  count: number;
  performance: number;
  queued: number;
  jobs: number;
  type: string;
  eta: number;
}

export interface GenerationFormData {
  Prompt: string;
  email: string;
  Model: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string; // Stored as a base64 data URL
  model: string;
  timestamp: number;
}

export interface Profile {
  id: string;
  credits: number;
  email?: string;
  role?: string;
  is_pro?: boolean;
  last_credit_reward_at?: string;
}