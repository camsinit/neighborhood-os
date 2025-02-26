
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
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the user's neighborhood
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

        if (error) throw error;

        if (data?.neighborhoods) {
          setCurrentNeighborhood(data.neighborhoods as Neighborhood);
        }
      } catch (err) {
        console.error('Error fetching neighborhood:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch neighborhood'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchNeighborhood();
  }, [user]);

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
