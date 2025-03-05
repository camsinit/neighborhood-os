
// This file implements the SupabaseProvider component
// It provides Supabase authentication context to the entire application

import { createContext, useContext, useState, useEffect } from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";

/**
 * SupabaseProvider Component
 * 
 * This component wraps the application with Supabase authentication context
 * It handles session management and user authentication state
 * 
 * @param children - The child components to be wrapped with the provider
 */
export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  // Use Supabase's SessionContextProvider to provide authentication context
  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
};
