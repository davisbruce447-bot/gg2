
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { CreditDisplay } from './CreditDisplay';
import { supabase } from '../services/supabaseClient';
import { LogoutIcon } from './icons/LogoutIcon';
import { AdminIcon } from './icons/AdminIcon';

interface HeaderProps {
  credits: number;
  isAdmin: boolean;
  onAdminClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ credits, isAdmin, onAdminClick }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="w-8 h-8 text-indigo-400" />
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            DreamForge
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <CreditDisplay credits={credits} />
          {isAdmin && (
            <button
              onClick={onAdminClick}
              title="Admin Panel"
              className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <AdminIcon className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <LogoutIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};