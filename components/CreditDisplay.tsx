import React from 'react';
import { CoinIcon } from './icons/CoinIcon';

interface CreditDisplayProps {
  credits: number;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({ credits }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-800/60 border border-gray-700/50 rounded-full px-4 py-1.5">
      <CoinIcon className="w-5 h-5 text-yellow-400" />
      <span className="font-semibold text-white">{credits}</span>
      <span className="text-gray-400 text-sm">Credits</span>
    </div>
  );
};