
import { useState, useEffect, useCallback } from "react";
import { useNeighborhood } from "@/hooks/useNeighborhood";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

/**
 * Custom hook to manage dashboard state and logic
 * 
 * This hook encapsulates all the state and side effects needed for the dashboard,
 * allowing the main component to be more focused on rendering.
 */
export const useDashboardState = () => {
  // Get neighborhood context and user data with our new hook
  const { 
    neighborhood: currentNeighborhood, 
    isLoading, 
    error, 
    refreshNeighborhood,
    isBackgroundRefreshing
  } = useNeighborhood();
  
  const user = useUser();

  // Local state for refresh operations
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
  
  // Set up timeout detection for prolonged loading
  useEffect(() => {
    if (isLoading) {
      // If loading takes more than 15 seconds, mark it as a timeout
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setIsLoadingTimeout(true);
          console.warn("[DashboardState] Loading timeout detected after 15 seconds");
          
          // Show toast notification to user
          toast.warning("Loading is taking longer than expected", {
            description: "You can try refreshing the page or checking your connection.",
            duration: 5000
          });
        }
      }, 15000);
      
      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      // Reset timeout state when loading completes
      setIsLoadingTimeout(false);
    }
  }, [isLoading]);
  
  // Log component state for debugging
  useEffect(() => {
    console.log("[DashboardState] State updated:", {
      hasNeighborhood: !!currentNeighborhood,
      isLoading,
      error: error?.message || null,
      userId: user?.id,
      isRefreshing,
      hasAttemptedRefresh,
      isLoadingTimeout,
      backgroundRefreshing: isBackgroundRefreshing,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error, user, isRefreshing, hasAttemptedRefresh, isLoadingTimeout, isBackgroundRefreshing]);

  // Handle manual refresh with improved error handling
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setHasAttemptedRefresh(true);
    
    console.log("[DashboardState] Manual refresh triggered");
    
    // Show loading toast
    toast.loading("Refreshing neighborhood data...");
    
    // Perform the refresh
    refreshNeighborhood()
      .then(() => {
        console.log("[DashboardState] Refresh completed successfully");
        toast.success("Data refreshed successfully");
      })
      .catch((err) => {
        console.error("[DashboardState] Refresh failed:", err);
        toast.error("Refresh failed", {
          description: err.message || "An error occurred while refreshing data"
        });
      })
      .finally(() => {
        // Reset refresh state after delay
        setTimeout(() => {
          setIsRefreshing(false);
        }, 1000);
      });
  }, [refreshNeighborhood]);

  // Return all state and handlers needed by the dashboard
  return {
    currentNeighborhood,
    isLoading,
    error,
    user,
    isRefreshing,
    hasAttemptedRefresh,
    isLoadingTimeout,
    handleRefresh
  };
};
