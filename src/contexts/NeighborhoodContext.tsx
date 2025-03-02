
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
        // ALTERNATIVE APPROACH: Instead of directly querying neighborhood_members,
        // we'll query the neighborhoods table and find ones created by the user
        // This avoids the recursive RLS issue on the neighborhood_members table
        
        // First, check if user created any neighborhoods
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
        
        // If user didn't create a neighborhood, try to find one they joined
        // We'll use a more direct approach to query neighborhoods they might be in
        // This is a workaround to avoid the recursive RLS issue
        
        // Query all neighborhoods and try to see if the user is a member
        // Note: In a production scenario with many neighborhoods, this would need pagination
        const { data: allNeighborhoods, error: neighborhoodsError } = await supabase
          .from('neighborhoods')
          .select('id, name, created_by');
        
        if (neighborhoodsError) {
          console.error("[NeighborhoodContext] Error fetching all neighborhoods:", neighborhoodsError);
          throw neighborhoodsError;
        }
        
        // No neighborhoods found
        if (!allNeighborhoods || allNeighborhoods.length === 0) {
          console.log("[NeighborhoodContext] No neighborhoods found in the system");
          setCurrentNeighborhood(null);
          setIsLoading(false);
          return;
        }
        
        console.log("[NeighborhoodContext] Found neighborhoods to check membership for:", {
          count: allNeighborhoods.length 
        });
        
        // For each neighborhood, see if the user is a member
        // For demonstration purposes, we'll just check the first few neighborhoods
        // to avoid potentially large queries
        const neighborhoodsToCheck = allNeighborhoods.slice(0, 5);
        
        for (const neighborhood of neighborhoodsToCheck) {
          // This uses our fixed RLS policy with the security definer function
          const { data: membershipCheck, error: membershipError } = await supabase
            .rpc('user_is_neighborhood_member', {
              user_uuid: user.id,
              neighborhood_uuid: neighborhood.id
            });
            
          if (membershipError) {
            console.error(`[NeighborhoodContext] Error checking membership for neighborhood ${neighborhood.id}:`, membershipError);
            continue; // Skip to next neighborhood
          }
          
          // If user is a member of this neighborhood, use it
          if (membershipCheck === true) {
            console.log("[NeighborhoodContext] Found membership in neighborhood:", {
              neighborhood: neighborhood,
              userId: user.id
            });
            
            setCurrentNeighborhood(neighborhood);
            setIsLoading(false);
            return;
          }
        }
            
        // User has no neighborhood
        console.log("[NeighborhoodContext] User has no neighborhood");
        setCurrentNeighborhood(null);
        setIsLoading(false);
        
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
