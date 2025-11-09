import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './Header';
import { ImageForm } from './ImageForm';
import { ImageDisplay } from './ImageDisplay';
import { ErrorMessage } from './ErrorMessage';
import { fetchModels, generateImage } from '../services/n8nWorkflowService';
import { supabase } from '../services/supabaseClient';
import { IMAGE_GENERATION_COST } from '../constants';
import type { StableHordeModel, FormData } from '../types';
import type { Session } from '@supabase/supabase-js';

interface DreamForgeAppProps {
  session: Session;
}

export const DreamForgeApp: React.FC<DreamForgeAppProps> = ({ session }) => {
  const [models, setModels] = useState<StableHordeModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number>(0);
  
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState<boolean>(true);


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
    const fetchUserCredits = async () => {
      if (!session.user) return;
      setIsLoadingCredits(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', session.user.id)
          .single();

        if (fetchError) {
          console.error('Error fetching credits:', fetchError);
          setError("Could not load your credit balance. This can happen on first sign-in. Please refresh the page in a moment.");
          setCredits(0);
        } else if (data) {
          setCredits(data.credits);
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching your credits.");
        console.error(err);
        setCredits(0);
      } finally {
        setIsLoadingCredits(false);
      }
    };

    fetchUserCredits();
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
      const imageUrl = URL.createObjectURL(imageBlob);
      setGeneratedImage(imageUrl);

      const newCredits = credits - IMAGE_GENERATION_COST;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', session.user.id);

      if (updateError) {
        console.error("Failed to update credits:", updateError);
        setError("Image generated, but failed to update your credit balance.");
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
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header credits={credits ?? 0} />
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
            />
          </div>
          <ImageDisplay
            imageUrl={generatedImage}
            isGenerating={isGenerating}
            generationTime={generationTime}
          />
        </div>
      </main>
    </div>
  );
};
