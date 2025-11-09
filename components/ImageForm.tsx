import React, { useState } from 'react';
import type { StableHordeModel, FormData } from '../types';
import { IMAGE_GENERATION_COST } from '../constants';

interface ImageFormProps {
  models: StableHordeModel[];
  onSubmit: (formData: Omit<FormData, 'email'>) => void;
  isGenerating: boolean;
  isLoadingModels: boolean;
  isLoadingCredits: boolean;
  credits: number | null;
  userEmail: string | undefined;
}

export const ImageForm: React.FC<ImageFormProps> = ({
  models,
  onSubmit,
  isGenerating,
  isLoadingModels,
  isLoadingCredits,
  credits,
  userEmail,
}) => {
  const [prompt, setPrompt] = useState('A beautiful watercolor painting of a majestic fox in a vibrant autumn forest');
  const [selectedModel, setSelectedModel] = useState('Deliberate');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;
    onSubmit({ Prompt: prompt, Model: selectedModel });
  };

  const isDisabled = isGenerating || isLoadingModels || isLoadingCredits || credits === null || credits < IMAGE_GENERATION_COST;

  const getButtonText = () => {
    if (isGenerating) return 'Generating...';
    if (isLoadingCredits) return 'Loading Credits...';

    const cost = IMAGE_GENERATION_COST;
    const creditText = cost === 1 ? 'Credit' : 'Credits';
    if (credits !== null && credits >= cost) {
      return `Generate Image (${cost} ${creditText})`;
    }
    
    return 'Out of Credits';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 p-6 rounded-lg border border-gray-700">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="w-full bg-gray-900 border-gray-700 rounded-md shadow-sm text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="e.g., A robot holding a red skateboard"
          required
          disabled={isDisabled}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Your Email
        </label>
        <input
          type="email"
          id="email"
          value={userEmail || ''}
          className="w-full bg-gray-900/50 border-gray-700 rounded-md shadow-sm text-gray-400 cursor-not-allowed"
          readOnly
          disabled
        />
        <p className="mt-2 text-xs text-gray-500">Image will be sent to this email. To change, please log out and sign in with a different account.</p>
      </div>
      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-2">
          Model
        </label>
        <select
          id="model"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full bg-gray-900 border-gray-700 rounded-md shadow-sm text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
          required
          disabled={isDisabled}
        >
          <option value="Deliberate">Deliberate</option>
          <option value="AbsoluteReality">AbsoluteReality</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isDisabled}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:bg-indigo-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300"
      >
        {getButtonText()}
      </button>
       {credits !== null && credits < IMAGE_GENERATION_COST && !isGenerating && (
        <p className="text-center text-sm text-yellow-500 mt-4">
          You've used all your free credits. Upgrade to Pro for unlimited generations!
        </p>
      )}
    </form>
  );
};
