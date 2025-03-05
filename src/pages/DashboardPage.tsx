
import { useNavigate } from "react-router-dom";
import { useDashboardState } from "@/hooks/dashboard/useDashboardState";
import { LoadingState } from "@/components/ui/loading-state";
import ErrorState from "@/components/dashboard/ErrorState";
import NoNeighborhoodState from "@/components/dashboard/NoNeighborhoodState";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { useEffect } from "react";

/**
 * DashboardPage Component
 * 
 * This component serves as the main dashboard for the neighborhood app.
 * It coordinates between different states and renders the appropriate component:
 * - Loading: When neighborhood data is being fetched
 * - Error: When there's an issue fetching neighborhood data
 * - No Neighborhood: When the user doesn't belong to any neighborhood
 * - Dashboard: The actual dashboard content when everything is loaded
 */
const DashboardPage = () => {
  // Navigation hook
  const navigate = useNavigate();
  
  // Custom hook for all dashboard state and logic
  const {
    currentNeighborhood,
    isLoading,
    error,
    isRefreshing,
    hasAttemptedRefresh,
    handleRefresh,
    isLoadingTimeout
  } = useDashboardState();

  // Log render information for debugging
  useEffect(() => {
    console.log("[DashboardPage] Rendering with state:", {
      hasNeighborhood: !!currentNeighborhood,
      neighborhoodName: currentNeighborhood?.name,
      isLoading,
      hasError: !!error,
      errorMessage: error?.message,
      isRefreshing,
      hasAttemptedRefresh,
      isLoadingTimeout,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error, isRefreshing, hasAttemptedRefresh, isLoadingTimeout]);

  // Handle navigation to home page
  const handleNavigateHome = () => navigate('/');

  // If still loading, show improved loading state with timeout detection
  if (isLoading) {
    return (
      <LoadingState 
        title="Loading Your Neighborhood"
        description="We're connecting you with your neighborhood information."
        isRefreshing={isRefreshing} 
        onRefresh={handleRefresh} 
        showTimeout={true}
        timeoutDelay={10000} // Show timeout message after 10 seconds
      />
    );
  }

  // If error occurred, show error message with retry option
  if (error) {
    return (
      <ErrorState 
        error={error} 
        isRefreshing={isRefreshing} 
        onRefresh={handleRefresh}
        onNavigateHome={handleNavigateHome}
      />
    );
  }

  // If no neighborhood is assigned
  if (!currentNeighborhood) {
    return (
      <NoNeighborhoodState 
        hasAttemptedRefresh={hasAttemptedRefresh}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onNavigateHome={handleNavigateHome}
      />
    );
  }

  // Main dashboard content when neighborhood is loaded successfully
  return <DashboardContent neighborhood={currentNeighborhood} />;
};

export default DashboardPage;
