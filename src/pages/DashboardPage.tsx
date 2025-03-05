
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { LoadingSpinner } from '@/components/ui/loading';
import { useNeighborhood } from '@/contexts/NeighborhoodContext';

/**
 * DashboardPage Component
 * 
 * This is the main dashboard page after login.
 * It handles redirection based on neighborhood status
 * and provides meaningful loading/error states.
 */
const DashboardPage = () => {
  // Get navigation and authentication context
  const navigate = useNavigate();
  const { isLoading: sessionLoading } = useSessionContext();
  
  // Get neighborhood data from context
  const { 
    currentNeighborhood, 
    isLoading: neighborhoodLoading, 
    error: neighborhoodError,
    refreshNeighborhoodData
  } = useNeighborhood();
  
  // Combined loading state
  const isLoading = sessionLoading || neighborhoodLoading;
  
  // Log component mounting and state for debugging
  useEffect(() => {
    console.log("[DashboardPage] Mounting component", {
      sessionLoading,
      neighborhoodLoading,
      hasNeighborhood: !!currentNeighborhood
    });
  }, [sessionLoading, neighborhoodLoading, currentNeighborhood]);
  
  // Handle redirection based on neighborhood status
  useEffect(() => {
    // Only proceed when we're done loading
    if (!isLoading) {
      if (neighborhoodError) {
        // If there's an error, log it but don't redirect
        console.error("[DashboardPage] Error loading neighborhood data:", neighborhoodError);
        // Stay on dashboard to show error state
      } else if (currentNeighborhood) {
        // If user has a neighborhood, go to neighbors page
        console.log("[DashboardPage] User has neighborhood, redirecting to neighbors page");
        navigate('/neighbors', { replace: true });
      } else {
        // If no neighborhood, prompt user to create one or join one
        console.log("[DashboardPage] User has no neighborhood, redirecting to settings page");
        navigate('/settings', { replace: true });
      }
    }
  }, [isLoading, neighborhoodError, currentNeighborhood, navigate]);
  
  // Error state - show error message with retry button
  if (!isLoading && neighborhoodError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-md max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading your neighborhood data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{neighborhoodError.message || 'Please try again or contact support if the issue persists.'}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => refreshNeighborhoodData()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Loading state - show spinner with helpful message
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        {isLoading && neighborhoodLoading && !sessionLoading && (
          <p className="mt-2 text-sm text-gray-500">Looking up your neighborhood information...</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
