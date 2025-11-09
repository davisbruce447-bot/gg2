import React from 'react';
import type { HistoryItem } from '../types';
import { ReuseIcon } from './icons/ReuseIcon';

interface HistoryPanelProps {
  history: HistoryItem[];
  onReusePrompt: (prompt: string, model: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onReusePrompt }) => {
  if (history.length === 0) {
    return null; // Don't render anything if there's no history
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-700/50">
      <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 mb-6">
        Generation History
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {history.map((item) => (
          <div key={item.id} className="group relative bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden flex flex-col shadow-lg">
            <img src={item.imageUrl} alt={item.prompt.slice(0, 50)} className="aspect-square w-full object-cover" />
            <div className="p-4 flex flex-col flex-grow">
              <p className="text-sm text-gray-400 line-clamp-3 flex-grow" title={item.prompt}>
                {item.prompt}
              </p>
              <div className="mt-3 flex items-center justify-between">
                 <span className="text-xs font-mono bg-gray-700/50 text-gray-300 px-2 py-1 rounded">
                   {item.model}
                 </span>
                 <button
                   onClick={() => onReusePrompt(item.prompt, item.model)}
                   title="Reuse Prompt & Model"
                   className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                 >
                   <ReuseIcon className="w-5 h-5" />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
