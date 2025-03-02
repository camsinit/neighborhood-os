
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
        // Now that we have fixed RLS policies, we can directly query neighborhood_members
        // Our security definer functions prevent recursion issues
        console.log("[NeighborhoodContext] Querying neighborhood_members with new RLS policies");
        
        // First try to get the user's neighborhood membership
        const { data: membershipData, error: membershipError } = await supabase
          .from('neighborhood_members')
          .select('neighborhood_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('joined_at', { ascending: false })
          .limit(1)
          .single();

        // Check for membership error
        if (membershipError) {
          // If no membership found (common case), check if user created a neighborhood
          if (membershipError.code === 'PGRST116') { // No data found error code
            console.log("[NeighborhoodContext] No active membership found, checking created neighborhoods");
            
            // Check if user created any neighborhoods
            const { data: createdNeighborhoods, error: creationError } = await supabase
              .from('neighborhoods')
              .select('id, name, created_by')
              .eq('created_by', user.id)
              .order('created_at', { ascending: false })
              .limit(1);
              
            if (creationError) {
              console.error("[NeighborhoodContext] Error checking created neighborhoods:", creationError);
              throw creationError;
            }
            
            // If user created neighborhoods, use the first one
            if (createdNeighborhoods && createdNeighborhoods.length > 0) {
              console.log("[NeighborhoodContext] Found user-created neighborhood:", {
                neighborhood: createdNeighborhoods[0],
                userId: user.id
              });
              
              setCurrentNeighborhood(createdNeighborhoods[0]);
              setIsLoading(false);
              return;
            }
            
            // User has no neighborhood
            console.log("[NeighborhoodContext] User has no neighborhood");
            setCurrentNeighborhood(null);
            setIsLoading(false);
            return;
          }
          
          // Real error, not just "no data"
          console.error("[NeighborhoodContext] Error fetching neighborhood membership:", {
            error: membershipError,
            code: membershipError.code,
            message: membershipError.message,
            details: membershipError.details
          });
          throw membershipError;
        }
        
        // If we have a membership, get the neighborhood details
        console.log("[NeighborhoodContext] Found membership with neighborhood:", membershipData.neighborhood_id);
        
        // Get details of the neighborhood the user belongs to
        const { data: neighborhoodData, error: neighborhoodError } = await supabase
          .from('neighborhoods')
          .select('id, name, created_by')
          .eq('id', membershipData.neighborhood_id)
          .single();
          
        if (neighborhoodError) {
          console.error("[NeighborhoodContext] Error fetching neighborhood details:", neighborhoodError);
          throw neighborhoodError;
        }
        
        console.log("[NeighborhoodContext] Neighborhood details loaded:", {
          id: neighborhoodData.id,
          name: neighborhoodData.name
        });
        
        // Update state with the fetched neighborhood
        setCurrentNeighborhood(neighborhoodData);
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
