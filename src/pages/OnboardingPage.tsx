
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { useNeighborhood } from '@/contexts/NeighborhoodContext';
import NewNeighborOnboarding from '@/components/onboarding/NewNeighborOnboarding';
import { LoadingSpinner } from '@/components/ui/loading';

/**
 * OnboardingPage Component
 * 
 * This page handles the onboarding flow for new neighbors.
 * It checks if the user is logged in and has a neighborhood,
 * then displays the appropriate onboarding flow.
 */
const OnboardingPage = () => {
  // State for loading status
  const [isLoading, setIsLoading] = useState(true);
  
  // Get hooks
  const user = useUser();
  const { currentNeighborhood, isLoading: neighborhoodLoading } = useNeighborhood();
  const navigate = useNavigate();
  
  // Check authentication and neighborhood status
  useEffect(() => {
    // If not logged in, redirect to login
    if (user === null) {
      navigate('/login', { replace: true });
      return;
    }
    
    // Wait for neighborhood data to load
    if (!neighborhoodLoading) {
      setIsLoading(false);
    }
  }, [user, neighborhoodLoading, navigate]);
  
  // If still loading, show spinner
  if (isLoading || neighborhoodLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Render the appropriate onboarding flow
  return <NewNeighborOnboarding />;
};

export default OnboardingPage;
