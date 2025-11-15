
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Profile } from '../types';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { BackIcon } from '../components/icons/BackIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';

interface AdminPageProps {
  onBack: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCredits, setEditingCredits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [togglingPro, setTogglingPro] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, credits, email, last_credit_reward_at, role, is_pro');

        if (fetchError) throw fetchError;
        
        setProfiles(data?.filter(p => p.email).sort((a,b) => (a.email || '').localeCompare(b.email || '')) || []);
      } catch (err: any) {
        setError('Failed to fetch user profiles. Ensure you have admin privileges and the correct RLS policies are set up in Supabase.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleSaveCredits = async (userId: string) => {
    const newCreditsStr = editingCredits[userId];
    if (newCreditsStr === undefined) return;
    
    const newCredits = parseInt(newCreditsStr, 10);
    if (isNaN(newCredits) || newCredits < 0) {
      alert('Please enter a valid non-negative number for credits.');
      return;
    }

    setSaving(prev => ({ ...prev, [userId]: true }));
    setError(null);

    try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', userId);

        if (updateError) throw updateError;
        
        setProfiles(prevProfiles =>
          prevProfiles.map(p =>
            p.id === userId ? { ...p, credits: newCredits } : p
          )
        );
        
        setEditingCredits(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });

    } catch (err: any) {
      const detailedMessage = `Failed to update credits for user. Check RLS policies. (Details: ${err.message})`;
      setError(detailedMessage);
      console.error(err);
    } finally {
        setSaving(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleTogglePro = async (userId: string, currentIsPro: boolean | undefined) => {
    setTogglingPro(prev => ({ ...prev, [userId]: true }));
    setError(null);
    const newIsPro = !currentIsPro;

    try {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_pro: newIsPro })
            .eq('id', userId);

        if (updateError) throw updateError;
        
        setProfiles(prevProfiles =>
            prevProfiles.map(p =>
                p.id === userId ? { ...p, is_pro: newIsPro } : p
            )
        );
    } catch (err: any) {
        const detailedMessage = `Failed to update pro status for user. Check RLS policies. (Details: ${err.message})`;
        setError(detailedMessage);
        console.error(err);
    } finally {
        setTogglingPro(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => 
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [profiles, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
          <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-8 h-8 text-indigo-400" />
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                DreamForge - Admin Panel
              </h1>
            </div>
            <button
                onClick={onBack}
                title="Back to App"
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-300 bg-gray-700/50 hover:bg-gray-700 transition-colors"
            >
                <BackIcon className="w-5 h-5" />
                <span>Back to App</span>
            </button>
          </div>
        </header>

        <main className="container mx-auto p-4 md:p-8">
            {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <div className="mb-6">
                    <input 
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm bg-gray-900 border-gray-700 rounded-md shadow-sm text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Credits</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Reward At</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800/50 divide-y divide-gray-700/50">
                                {filteredProfiles.map((profile) => (
                                    <tr key={profile.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-medium">{profile.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{profile.credits}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.is_pro ? 'bg-indigo-900 text-indigo-300' : 'bg-gray-700 text-gray-300'}`}>
                                                {profile.is_pro ? 'Pro' : 'Free'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {profile.last_credit_reward_at ? new Date(profile.last_credit_reward_at).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.role === 'admin' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                                                {profile.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="number"
                                                        value={editingCredits[profile.id] ?? ''}
                                                        onChange={(e) => setEditingCredits(prev => ({ ...prev, [profile.id]: e.target.value }))}
                                                        className="w-24 bg-gray-900 border-gray-600 rounded-md text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="Set credits"
                                                    />
                                                    <button
                                                      onClick={() => handleSaveCredits(profile.id)}
                                                      disabled={saving[profile.id] || editingCredits[profile.id] === undefined}
                                                      className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {saving[profile.id] ? '...' : 'Save'}
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleTogglePro(profile.id, profile.is_pro)}
                                                    disabled={togglingPro[profile.id]}
                                                    className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 disabled:bg-gray-900/50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {togglingPro[profile.id] ? '...' : (profile.is_pro ? 'Set Free' : 'Set Pro')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredProfiles.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                No users found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    </div>
  );
};