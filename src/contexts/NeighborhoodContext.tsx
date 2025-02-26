
import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';

// Define types for our context
interface Neighborhood {
  id: string;
  name: string;
  created_by: string;
}

interface NeighborhoodContextType {
  currentNeighborhood: Neighborhood | null; // Still null for loading state
  isLoading: boolean;
  error: Error | null;
}

// Create the context
const NeighborhoodContext = createContext<NeighborhoodContextType>({
  currentNeighborhood: null,
  isLoading: true,
  error: null,
});

// Create the provider component
export function NeighborhoodProvider({ children }: { children: React.ReactNode }) {
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();

  useEffect(() => {
    async function fetchNeighborhood() {
      // Reset states at the start of each fetch
      setError(null);
      setIsLoading(true);

      if (!user) {
        console.log("[NeighborhoodContext] No user found, skipping fetch");
        setIsLoading(false);
        return;
      }

      console.log("[NeighborhoodContext] Starting neighborhood fetch for user:", user.id);

      try {
        // Fetch neighborhood data - use single() since every user must have a neighborhood
        const { data, error: fetchError } = await supabase
          .from('neighborhood_members')
          .select(`
            neighborhoods:neighborhood_id (
              id,
              name,
              created_by
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          console.error("[NeighborhoodContext] Fetch error:", fetchError);
          throw new Error(`User has no assigned neighborhood. This should never happen. Error: ${fetchError.message}`);
        }

        if (!data?.neighborhoods) {
          throw new Error('Neighborhood data is missing. This should never happen.');
        }

        console.log("[NeighborhoodContext] Setting neighborhood:", data.neighborhoods);
        setCurrentNeighborhood(data.neighborhoods as Neighborhood);

      } catch (err) {
        console.error("[NeighborhoodContext] Critical error:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch neighborhood'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchNeighborhood();
  }, [user]);

  // Log state changes
  useEffect(() => {
    console.log("[NeighborhoodContext] State updated:", {
      currentNeighborhood,
      isLoading,
      error,
      userId: user?.id
    });
  }, [currentNeighborhood, isLoading, error, user]);

  return (
    <NeighborhoodContext.Provider value={{ currentNeighborhood, isLoading, error }}>
      {children}
    </NeighborhoodContext.Provider>
  );
}

// Create a custom hook for using the neighborhood context
export function useNeighborhood() {
  const context = useContext(NeighborhoodContext);
  if (context === undefined) {
    throw new Error('useNeighborhood must be used within a NeighborhoodProvider');
  }
  return context;
}
