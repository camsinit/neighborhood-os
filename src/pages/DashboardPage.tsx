
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { LoadingSpinner } from '@/components/ui/loading';
import { useNeighborhood } from '@/contexts/NeighborhoodContext';

/**
 * DashboardPage Component
 * 
 * This is the main dashboard page after login.
 * It redirects to different pages depending on the user's neighborhood status.
 */
const DashboardPage = () => {
  // Get navigation and session context
  const navigate = useNavigate();
  const { isLoading: sessionLoading } = useSessionContext();
  
  // Get neighborhood data
  const { currentNeighborhood, isLoading: neighborhoodLoading } = useNeighborhood();
  
  // Log debugging information
  useEffect(() => {
    console.log('[DashboardPage] Mounting component', {
      sessionLoading,
      neighborhoodLoading,
      hasNeighborhood: !!currentNeighborhood
    });
  }, [sessionLoading, neighborhoodLoading, currentNeighborhood]);
  
  // Redirect based on neighborhood status when data is loaded
  useEffect(() => {
    // Only take action when we're done loading neighborhood data
    if (!neighborhoodLoading && !sessionLoading) {
      if (currentNeighborhood) {
        // If user has a neighborhood, go to neighbors page
        console.log('[DashboardPage] User has neighborhood, redirecting to neighbors page');
        navigate('/neighbors', { replace: true });
      } else {
        // If no neighborhood, prompt user to create one (for now, go to settings)
        console.log('[DashboardPage] User has no neighborhood, redirecting to settings page');
        navigate('/settings', { replace: true });
      }
    }
  }, [neighborhoodLoading, sessionLoading, currentNeighborhood, navigate]);
  
  // Show loading spinner while checking neighborhood status
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default DashboardPage;
