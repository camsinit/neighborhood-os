
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
  currentNeighborhood: Neighborhood | null;
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
      if (!user) {
        console.log("[NeighborhoodContext] No user found, skipping fetch");
        setIsLoading(false);
        return;
      }

      console.log("[NeighborhoodContext] Fetching neighborhood for user:", user.id);

      try {
        const { data, error } = await supabase
          .from('neighborhood_members')
          .select(`
            neighborhood_id,
            neighborhoods:neighborhood_id (
              id,
              name,
              created_by
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("[NeighborhoodContext] Error fetching neighborhood:", error);
          throw error;
        }

        console.log("[NeighborhoodContext] Fetched data:", data);

        if (data?.neighborhoods) {
          console.log("[NeighborhoodContext] Setting neighborhood:", data.neighborhoods);
          setCurrentNeighborhood(data.neighborhoods as Neighborhood);
        } else {
          console.log("[NeighborhoodContext] No neighborhood found for user");
          setCurrentNeighborhood(null);
        }
      } catch (err) {
        console.error("[NeighborhoodContext] Error:", err);
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
      error
    });
  }, [currentNeighborhood, isLoading, error]);

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
