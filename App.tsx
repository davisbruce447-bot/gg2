
import React, { useState, useEffect } from 'react';
import { DreamForgeApp } from './components/DreamForgeApp';
import { AuthPage } from './pages/AuthPage';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';


const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!session) {
    return <AuthPage />;
  }

  return <DreamForgeApp session={session} />;
};

export default App;