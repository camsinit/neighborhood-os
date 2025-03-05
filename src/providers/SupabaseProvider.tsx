
import { ReactNode } from 'react';
import { NeighborhoodProvider } from '@/contexts/NeighborhoodContext';

/**
 * SupabaseProvider Component
 * 
 * This component provides a single wrapper for all Supabase-related providers.
 * Currently, it includes the NeighborhoodProvider.
 * 
 * @param children - The components that will have access to the providers
 */
interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  return (
    // This wrapper is maintained for backward compatibility
    // The actual NeighborhoodProvider is now in the main.tsx file
    // so we just pass children through
    <>{children}</>
  );
};

export default SupabaseProvider;
