
export interface StableHordeModel {
  name: string;
  count: number;
  performance: number;
  queued: number;
  jobs: number;
  type: string;
  eta: number;
}

export interface FormData {
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
