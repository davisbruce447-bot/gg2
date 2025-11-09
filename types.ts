
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
