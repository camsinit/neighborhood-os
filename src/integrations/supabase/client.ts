
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Replace these values with your new project's URL and anon key
const SUPABASE_URL = "YOUR_NEW_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_NEW_PROJECT_ANON_KEY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Add basic connection test
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error connecting to Supabase:', error);
  } else {
    console.log('Successfully connected to Supabase');
  }
});
