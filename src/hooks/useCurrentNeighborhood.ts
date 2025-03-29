
import { useNeighborhood } from "@/contexts/neighborhood";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

/**
 * Custom hook to get the current neighborhood ID and throw an error if none is selected
 * This is a critical hook used throughout the application to ensure proper neighborhood context
 * 
 * @returns The current neighborhood ID
 * @throws Error if no neighborhood is selected
 */
export const useCurrentNeighborhood = () => {
  // Get the neighborhood context from the provider
  const { currentNeighborhood, isCoreContributor } = useNeighborhood();
  
  // Get the current authenticated user
  const user = useUser();
  
  // State to store debugging information
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Check authentication context on mount - this helps diagnose RLS issues
  useEffect(() => {
    const checkAuthContext = async () => {
      try {
        // Verify Supabase authentication context with direct query
        const { data: authResult } = await supabase
          .from('auth_users_view')
          .select('id')
          .limit(1);
        
        // Check if the user is associated with the neighborhood using direct query
        const { data: membershipCheck } = await supabase
          .from('neighborhood_members')
          .select('user_id') 
          .eq('user_id', user?.id || '')
          .eq('neighborhood_id', currentNeighborhood?.id || '')
          .eq('status', 'active')
          .maybeSingle();
        
        // Store debug information
        setDebugInfo({
          authContext: authResult?.[0]?.id === user?.id ? 'Valid' : 'Mismatch',
          membership: !!membershipCheck,
          userID: user?.id,
          neighborhoodID: currentNeighborhood?.id,
          timestamp: new Date().toISOString()
        });
        
        console.log("[useCurrentNeighborhood] Auth Context Check:", {
          authContextExists: !!authResult,
          authUserId: authResult?.[0]?.id,
          currentUserId: user?.id,
          membershipValid: !!membershipCheck,
          neighborhoodID: currentNeighborhood?.id
        });
      } catch (error) {
        console.error("[useCurrentNeighborhood] Auth context check failed:", error);
      }
    };
    
    // Only run this check if we have both a user and neighborhood
    if (user && currentNeighborhood?.id) {
      checkAuthContext();
    }
  }, [user, currentNeighborhood]);
  
  // Log the current neighborhood status with enhanced details for better debugging
  console.log("[useCurrentNeighborhood] Checking neighborhood context:", { 
    hasNeighborhood: !!currentNeighborhood?.id,
    neighborhoodId: currentNeighborhood?.id,
    neighborhoodName: currentNeighborhood?.name,
    isCoreContributor: isCoreContributor,
    timestamp: new Date().toISOString(),
    authStatus: !!user,
    userId: user?.id,
    stack: new Error().stack?.split('\n').slice(1, 3).join('\n') // Get stack trace to see where it's being called from
  });
  
  // If no neighborhood is selected, log detailed error information and throw an error
  if (!currentNeighborhood?.id) {
    // Enhance error logging with more context
    console.error("[useCurrentNeighborhood] ⚠️ NO NEIGHBORHOOD SELECTED - RLS WILL FAIL ⚠️", {
      neighborhoodContext: JSON.stringify(currentNeighborhood, null, 2),
      isCoreContributor: isCoreContributor,
      authStatus: !!user,
      userId: user?.id,
      debugInfo: debugInfo, // Include our debug information
      calledFrom: new Error().stack?.split('\n').slice(1, 5).join('\n'),
      timestamp: new Date().toISOString()
    });
    
    // Throw a more descriptive error
    throw new Error("No neighborhood selected - this will cause RLS policies to block data access");
  }
  
  // If we get here, we have a valid neighborhood ID, so log success and return it
  console.log("[useCurrentNeighborhood] ✅ Valid neighborhood found:", { 
    neighborhoodId: currentNeighborhood.id,
    neighborhoodName: currentNeighborhood.name,
    isCoreContributor: isCoreContributor,
    timestamp: new Date().toISOString(),
    userId: user?.id
  });
  
  return currentNeighborhood.id;
};
