import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables or fallback to the development values
const SUPABASE_URL = "https://edzjbrjxrgsnynolppss.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkempicmp4cmdzbnlub2xwcHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MzM2ODksImV4cCI6MjA0OTUwOTY4OX0.ADWwYJb0qTmEjFD7R1ASdJEvdPeSB_B5Dnr4mQZU1Vo";

// Add console logs to help debug the connection
console.log('Initializing Supabase client with URL:', SUPABASE_URL);

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test the connection and log the result
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error connecting to Supabase:', error);
  } else {
    console.log('Successfully connected to Supabase');
  }
});