import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://edzjbrjxrgsnynolppss.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkempicmp4cmdzbnlub2xwcHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MzM2ODksImV4cCI6MjA0OTUwOTY4OX0.ADWwYJb0qTmEjFD7R1ASdJEvdPeSB_B5Dnr4mQZU1Vo";

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