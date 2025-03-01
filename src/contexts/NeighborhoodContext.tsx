import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Define the structure for a neighborhood
 * This represents a community that users can belong to
 */
interface Neighborhood {
  id: string;
  name: string;
  created_by: string;
}

/**
 * Define the structure for our context
 * This provides neighborhood data to all components that need it
 */
interface NeighborhoodContextType {
  currentNeighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
}

// Create the context with default values
const NeighborhoodContext = createContext<NeighborhoodContextType>({
  currentNeighborhood: null,
  isLoading: true,
  error: null,
});

/**
 * NeighborhoodProvider component
 * 
 * This component fetches the user's active neighborhood membership
 * and provides it to all child components through the context.
 * 
 * @param children - Child components that will have access to the context
 */
export function NeighborhoodProvider({ children }: { children: React.ReactNode }) {
  // State variables to track the neighborhood data and loading status
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const user = useUser();

  useEffect(() => {
    // Function to fetch the user's active neighborhood
    async function fetchNeighborhood() {
      // Reset states at the start of each fetch
      setError(null);
      setIsLoading(true);

      // If no user is logged in, we can't fetch neighborhood data
      if (!user) {
        console.log("[NeighborhoodContext] No user found, skipping fetch", {
          userId: null,
          timestamp: new Date().toISOString()
        });
        setIsLoading(false);
        return;
      }

      console.log("[NeighborhoodContext] Starting neighborhood fetch for user:", {
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      try {
        // First, let's check if the user is a member of any neighborhood
        console.log("[NeighborhoodContext] Checking neighborhood_members table directly");
        const { data: memberData, error: memberError } = await supabase
          .from('neighborhood_members')
          .select('neighborhood_id, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('joined_at', { ascending: false })
          .limit(1)
          .single();

        if (memberError) {
          if (memberError.code === 'PGRST116') {
            // No data found is not a critical error, just means the user has no memberships
            console.log("[NeighborhoodContext] No active neighborhood memberships found");
          } else {
            // Only log this error but continue with the flow to check if user created neighborhoods
            console.error("[NeighborhoodContext] Error fetching membership:", {
              error: memberError,
              userId: user.id,
              timestamp: new Date().toISOString()
            });
          }
        } else if (memberData) {
          console.log("[NeighborhoodContext] Found membership:", {
            neighborhoodId: memberData.neighborhood_id,
            status: memberData.status,
            userId: user.id
          });
          
          // Now fetch the neighborhood details
          const { data: neighborhoodData, error: neighborhoodError } = await supabase
            .from('neighborhoods')
            .select('id, name, created_by')
            .eq('id', memberData.neighborhood_id)
            .single();
            
          if (neighborhoodError) {
            console.error("[NeighborhoodContext] Error fetching neighborhood details:", {
              error: neighborhoodError,
              neighborhoodId: memberData.neighborhood_id
            });
          } else if (neighborhoodData) {
            console.log("[NeighborhoodContext] Found neighborhood from membership:", {
              neighborhood: neighborhoodData,
              userId: user.id
            });
            
            setCurrentNeighborhood(neighborhoodData as Neighborhood);
            setIsLoading(false);
            return;
          }
        }

        // As a fallback, check if the user created any neighborhoods
        console.log("[NeighborhoodContext] Checking for user-created neighborhoods");
        const { data: neighborhoods, error: neighborhoodsError } = await supabase
          .from('neighborhoods')
          .select('id, name, created_by')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // If there's an error fetching neighborhoods
        if (neighborhoodsError) {
          console.error("[NeighborhoodContext] Neighborhoods fetch error:", {
            error: neighborhoodsError,
            userId: user.id,
            timestamp: new Date().toISOString()
          });
          
          // Try to continue with a null neighborhood instead of throwing
          setCurrentNeighborhood(null);
          setIsLoading(false);
          return;
        }

        // If the user has created a neighborhood, use the first one as their active neighborhood
        if (neighborhoods && neighborhoods.length > 0) {
          console.log("[NeighborhoodContext] Found user-created neighborhood:", {
            neighborhood: neighborhoods[0],
            userId: user.id,
            timestamp: new Date().toISOString()
          });
          
          setCurrentNeighborhood(neighborhoods[0] as Neighborhood);
          setIsLoading(false);
          return;
        }

        // If we reach here, the user doesn't have a neighborhood
        console.log("[NeighborhoodContext] No neighborhood found for user", {
          userId: user.id,
          timestamp: new Date().toISOString()
        });
        
        setCurrentNeighborhood(null);
      } catch (err) {
        // Handle unexpected errors
        console.error("[NeighborhoodContext] Critical error:", {
          error: err,
          userId: user?.id,
          timestamp: new Date().toISOString()
        });
        setError(err instanceof Error ? err : new Error('Failed to fetch neighborhood'));
      } finally {
        // Always mark loading as complete
        setIsLoading(false);
      }
    }

    // Call the fetch function when the component mounts or user changes
    fetchNeighborhood();
  }, [user]);

  // Log state changes for debugging
  useEffect(() => {
    console.log("[NeighborhoodContext] State updated:", {
      currentNeighborhood,
      isLoading,
      error,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error, user]);

  // Provide the context values to child components
  return (
    <NeighborhoodContext.Provider value={{ currentNeighborhood, isLoading, error }}>
      {children}
    </NeighborhoodContext.Provider>
  );
}

/**
 * useNeighborhood hook
 * 
 * A custom hook for consuming the NeighborhoodContext
 * Components can use this to access information about the user's neighborhood
 */
export function useNeighborhood() {
  const context = useContext(NeighborhoodContext);
  if (context === undefined) {
    throw new Error('useNeighborhood must be used within a NeighborhoodProvider');
  }
  return context;
}
