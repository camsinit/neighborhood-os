
import { useNeighborhood } from "@/contexts/neighborhood";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

/**
 * Custom hook to get the current neighborhood ID
 * SIMPLIFIED VERSION: No longer throws errors when no neighborhood is selected
 * 
 * @returns The current neighborhood ID or null if none selected
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
        
        // Store debug information
        setDebugInfo({
          authContext: authResult?.[0]?.id === user?.id ? 'Valid' : 'Mismatch',
          userID: user?.id,
          neighborhoodID: currentNeighborhood?.id,
          timestamp: new Date().toISOString()
        });
        
        console.log("[useCurrentNeighborhood] Auth Context Check:", {
          authContextExists: !!authResult,
          authUserId: authResult?.[0]?.id,
          currentUserId: user?.id,
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
  });
  
  // SIMPLIFIED: Instead of throwing an error, return null if no neighborhood is selected
  if (!currentNeighborhood?.id) {
    console.warn("[useCurrentNeighborhood] No neighborhood selected - returning null instead of throwing error");
    return null;
  }
  
  console.log("[useCurrentNeighborhood] ✅ Valid neighborhood found:", { 
    neighborhoodId: currentNeighborhood.id,
    neighborhoodName: currentNeighborhood.name,
    timestamp: new Date().toISOString(),
    userId: user?.id
  });
  
  return currentNeighborhood.id;
};
