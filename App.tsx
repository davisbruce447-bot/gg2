
import React, { useState, useEffect } from 'react';
import { DreamForgeApp } from './components/DreamForgeApp';
import { AuthPage } from './pages/AuthPage';
import { AdminPage } from './pages/AdminPage';
import { supabase } from './services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';


const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'main' | 'admin'>('main');

  const checkAdminRole = async (user: User | null) => {
    if (!user) {
        setIsAdmin(false);
        return;
    }
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        if (error && error.code !== 'PGRST116') { // 'PGRST116' means no rows found
          throw error;
        }

        if (profile?.role === 'admin') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
    }
  };


  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await checkAdminRole(session.user);
      }
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setView('main');
        await checkAdminRole(session?.user ?? null);
      }
    );

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

  if (isAdmin && view === 'admin') {
    return <AdminPage onBack={() => setView('main')} />;
  }

  return <DreamForgeApp session={session} isAdmin={isAdmin} onAdminClick={() => setView('admin')} />;
};

export default App;
