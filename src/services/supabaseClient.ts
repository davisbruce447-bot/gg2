import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your project's URL and Anon Key
const supabaseUrl = 'https://cgehkxkumycyqpzkopbd.supabase.co'; // e.g., 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZWhreGt1bXljeXFwemtvcGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NzcyMTAsImV4cCI6MjA3ODI1MzIxMH0.EPFGgY191YYQRwrAoIY4HxxQijJ-VZY4RaTkG3Iwp9c'; // e.g., 'ey...'

if (supabaseUrl.includes('YOUR_SUPABASE_PROJECT_URL') || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  throw new Error("Supabase URL and Anon Key have not been set. Please update them in 'services/supabaseClient.ts'");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});