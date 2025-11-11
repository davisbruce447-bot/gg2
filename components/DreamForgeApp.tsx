
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './Header';
import { ImageForm } from './ImageForm';
import { ImageDisplay } from './ImageDisplay';
import { ErrorMessage } from './ErrorMessage';
import { fetchModels, generateImage } from '../services/n8nWorkflowService';
import { supabase } from '../services/supabaseClient';
import { IMAGE_GENERATION_COST } from '../constants';
import { HistoryPanel } from './HistoryPanel';
import type { StableHordeModel, FormData, HistoryItem } from '../types';
import type { Session } from '@supabase/supabase-js';

interface DreamForgeAppProps {
  session: Session;
  isAdmin: boolean;
  onAdminClick: () => void;
}

export const DreamForgeApp: React.FC<DreamForgeAppProps> = ({ session, isAdmin, onAdminClick }) => {
  const [models, setModels] = useState<StableHordeModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number>(0);
  
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState<boolean>(true);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [reusedPrompt, setReusedPrompt] = useState<string | null>(null);
  const [reusedModel, setReusedModel] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('dreamforge-history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error("Failed to load or parse history from localStorage", err);
      // If parsing fails, clear the corrupted data
      localStorage.removeItem('dreamforge-history');
    }
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setError(null);
        setIsLoadingModels(true);
        const fetchedModels = await fetchModels();
        const activeImageModels = fetchedModels
          .filter(model => model.type === 'image' && model.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        setModels(activeImageModels);
      } catch (err) {
        setError('Failed to fetch available models. Please try again later.');
        console.error(err);
      } finally {
        setIsLoadingModels(false);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    const fetchUserCreditsAndRewardDaily = async () => {
      if (!session.user) return;
      
      setIsLoadingCredits(true);
      setError(null);

      let attempts = 0;
      const maxAttempts = 4;
      const delay = 1500;

      while (attempts < maxAttempts) {
        try {
          const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('credits, is_pro, last_credit_reward_at')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            let currentCredits = profile.credits;
            const lastRewardDate = profile.last_credit_reward_at ? new Date(profile.last_credit_reward_at) : null;
            const now = new Date();
            
            let needsCreditReward = false;
            if (!lastRewardDate) {
                // User has never received a reward, give them one.
                needsCreditReward = true; 
            } else {
                // Check if the last reward was given on a previous calendar day.
                const lastRewardDay = new Date(lastRewardDate.getFullYear(), lastRewardDate.getMonth(), lastRewardDate.getDate());
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                if (today.getTime() > lastRewardDay.getTime()) {
                    needsCreditReward = true;
                }
            }

            if (needsCreditReward) {
              const rewardAmount = profile.is_pro ? 100 : 5;
              const newTotalCredits = currentCredits + rewardAmount;

              const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                  credits: newTotalCredits,
                  last_credit_reward_at: now.toISOString() 
                })
                .eq('id', session.user.id);
              
              if (updateError) {
                console.error("Failed to apply daily credit reward:", updateError);
              } else {
                currentCredits = newTotalCredits;
              }
            }
            
            setCredits(currentCredits);
            setIsLoadingCredits(false);
            return; // Success, exit loop
          }

          if (fetchError && fetchError.code === 'PGRST116') {
            attempts++;
            if (attempts < maxAttempts) {
              console.warn(`Profile not found, retrying... (Attempt ${attempts}/${maxAttempts})`);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              throw new Error("Profile not found after multiple attempts.");
            }
          } else if (fetchError) {
             throw fetchError;
          } else {
            throw new Error("Unexpected response from database when fetching profile.");
          }
        } catch (err: any) {
          console.error('Final error fetching/updating credits:', err);
          setError("Could not load your credit balance. Please refresh the page and try again.");
          setCredits(0);
          setIsLoadingCredits(false);
          return; // Exit loop on final failure
        }
      }
    };

    fetchUserCreditsAndRewardDaily();
  }, [session.user]);

  const handleGenerate = useCallback(async (formData: Omit<FormData, 'email'>) => {
    if (credits === null || credits < IMAGE_GENERATION_COST) {
      setError("You do not have enough credits to generate an image.");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);
    setGenerationTime(0);

    const startTime = Date.now();
    const timer = setInterval(() => {
      setGenerationTime(Date.now() - startTime);
    }, 100);

    try {
      const fullFormData: FormData = {
        ...formData,
        email: session.user.email || '',
      };
      const imageBlob = await generateImage(fullFormData);
      
      // Create a temporary URL for immediate display
      const imageUrl = URL.createObjectURL(imageBlob);
      setGeneratedImage(imageUrl);

      // Convert to base64 to store in history for persistence
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const newHistoryItem: HistoryItem = {
          id: `${Date.now()}-${formData.Prompt.slice(0, 10)}`,
          prompt: formData.Prompt,
          imageUrl: base64data,
          model: formData.Model,
          timestamp: Date.now(),
        };

        setHistory(prevHistory => {
          const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 20); // Limit to 20 items
          localStorage.setItem('dreamforge-history', JSON.stringify(updatedHistory));
          return updatedHistory;
        });
      };

      const newCredits = credits - IMAGE_GENERATION_COST;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', session.user.id);

      if (updateError) {
        const detailedMessage = `Image generated, but failed to update credit balance. Check RLS policies. (Details: ${updateError.message})`;
        console.error("Failed to update credits:", updateError);
        setError(detailedMessage);
      }

      setCredits(newCredits);
    } catch (err) {
      setError('An error occurred during image generation. The workflow may have timed out or failed. Please check your inputs and try again.');
      console.error(err);
    } finally {
      clearInterval(timer);
      setIsGenerating(false);
    }
  }, [credits, session.user.id, session.user.email]);
  
  const handleReusePrompt = useCallback((prompt: string, model: string) => {
    setReusedPrompt(prompt);
    setReusedModel(model);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header credits={credits ?? 0} isAdmin={isAdmin} onAdminClick={onAdminClick} />
      <main className="container mx-auto p-4 md:p-8">
        {error && (
            <div className="mb-6">
                <ErrorMessage message={error} />
            </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
              Create Your Image
            </h2>
            <p className="text-gray-400">
              Describe the image you want to create, select a model, and let the AI bring your vision to life. This frontend triggers an n8n workflow that uses the Stable Horde distributed cluster.
            </p>
            <ImageForm
              models={models}
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
              isLoadingModels={isLoadingModels}
              isLoadingCredits={isLoadingCredits}
              credits={credits}
              userEmail={session.user.email}
              reusedPrompt={reusedPrompt}
              reusedModel={reusedModel}
            />
          </div>
          <ImageDisplay
            imageUrl={generatedImage}
            isGenerating={isGenerating}
            generationTime={generationTime}
          />
        </div>
        <HistoryPanel history={history} onReusePrompt={handleReusePrompt} />
      </main>
    </div>
  );
};
