
import { useNavigate } from "react-router-dom";
import { useDashboardState } from "@/hooks/dashboard/useDashboardState";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import NoNeighborhoodState from "@/components/dashboard/NoNeighborhoodState";
import DashboardContent from "@/components/dashboard/DashboardContent";

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
    handleRefresh
  } = useDashboardState();

  // Handle navigation to home page
  const handleNavigateHome = () => navigate('/');

  // If still loading, show loading state
  if (isLoading) {
    return (
      <LoadingState 
        isRefreshing={isRefreshing} 
        onRefresh={handleRefresh} 
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
