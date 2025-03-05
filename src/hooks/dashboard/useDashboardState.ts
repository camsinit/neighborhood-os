
import { useState, useEffect } from "react";
import { useNeighborhood } from "@/contexts/neighborhood";
import { useUser } from "@supabase/auth-helpers-react";

/**
 * Custom hook to manage dashboard state and logic
 * 
 * This hook encapsulates all the state and side effects needed for the dashboard,
 * allowing the main component to be more focused on rendering.
 */
export const useDashboardState = () => {
  // Get neighborhood context and user data
  const { 
    currentNeighborhood, 
    isLoading, 
    error, 
    refreshNeighborhoodData 
  } = useNeighborhood();
  const user = useUser();

  // Local state for refresh operations
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  
  // Log component state for debugging
  useEffect(() => {
    console.log("[DashboardPage] State updated:", {
      hasNeighborhood: !!currentNeighborhood,
      isLoading,
      error: error?.message || null,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error, user]);

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setHasAttemptedRefresh(true);
    refreshNeighborhoodData();
    
    // Reset refresh state after delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  // Return all state and handlers needed by the dashboard
  return {
    currentNeighborhood,
    isLoading,
    error,
    user,
    isRefreshing,
    hasAttemptedRefresh,
    handleRefresh
  };
};
