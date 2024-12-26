import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://edzjbrjxrgsnynolppss.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkempicmp4cmdzbnlub2xwcHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MzM2ODksImV4cCI6MjA0OTUwOTY4OX0.ADWwYJb0qTmEjFD7R1ASdJEvdPeSB_B5Dnr4mQZU1Vo";

// Add detailed logging to help debug connection issues
console.log('Initializing Supabase client with URL:', SUPABASE_URL);
console.log('Current origin:', window.location.origin);

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  },
});

// Test the connection and log the result
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error connecting to Supabase:', error);
  } else {
    console.log('Successfully connected to Supabase', data.session?.user?.id);
  }
});

// Add error logging to data fetching
const originalFrom = supabase.from;
supabase.from = function wrappedFrom(table: string) {
  const result = originalFrom.call(this, table);
  const originalSelect = result.select;
  
  result.select = function wrappedSelect(columns?: string) {
    const query = originalSelect.call(this, columns);
    const originalThen = query.then;
    
    query.then = function wrappedThen(onfulfilled, onrejected) {
      return originalThen.call(this, 
        (data: any) => {
          console.log(`Query result for ${table}:`, data);
          return onfulfilled?.(data);
        },
        (error: any) => {
          console.error(`Query error for ${table}:`, error);
          return onrejected?.(error);
        }
      );
    };
    
    return query;
  };
  
  return result;
};