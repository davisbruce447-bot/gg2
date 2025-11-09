
import { N8N_WEBHOOK_URL, STABLE_HORDE_MODELS_URL } from '../constants';
import type { StableHordeModel, FormData } from '../types';

export const fetchModels = async (): Promise<StableHordeModel[]> => {
  const response = await fetch(STABLE_HORDE_MODELS_URL);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const generateImage = async (formData: FormData): Promise<Blob> => {
  if (N8N_WEBHOOK_URL.includes('changeme')) {
    throw new Error('Please update the N8N_WEBHOOK_URL in constants.ts before proceeding.');
  }

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed with status: ${response.status}`);
  }

  // The n8n workflow is configured to return the binary image data directly.
  return response.blob();
};
