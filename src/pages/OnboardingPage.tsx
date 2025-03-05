
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import NewNeighborOnboarding from "@/components/onboarding/NewNeighborOnboarding";
import { LoadingSpinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

/**
 * OnboardingPage Component
 * 
 * This page serves as a wrapper for our onboarding flow.
 * It handles authentication state and redirects accordingly.
 */
const OnboardingPage = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { isLoading, session } = useSessionContext();
  const user = useUser();
  const navigate = useNavigate();

  // When component mounts, check auth state
  useEffect(() => {
    // If not loading and no user, redirect to login with return path
    if (!isLoading && !user) {
      const returnPath = window.location.pathname;
      console.log("[OnboardingPage] No user, redirecting to login with return path:", returnPath);
      navigate(`/login?returnTo=${encodeURIComponent(returnPath)}`);
    }
  }, [isLoading, user, navigate]);

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="text-gray-600">Loading your account information...</p>
      </div>
    );
  }

  // If no invite code is provided
  if (!inviteCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md text-center">
          <h1 className="text-xl font-bold text-red-800 mb-2">Invalid Invitation</h1>
          <p className="text-red-600 mb-4">
            No invitation code was provided. You need a valid invitation link to join a neighborhood.
          </p>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // If authenticated, show the onboarding flow
  if (user && session) {
    return <NewNeighborOnboarding inviteCode={inviteCode} />;
  }

  // Fallback state - should not reach here if redirecting works
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 max-w-md text-center">
        <h1 className="text-xl font-bold text-yellow-800 mb-2">Authentication Error</h1>
        <p className="text-yellow-600 mb-4">
          There was a problem verifying your account. Please try logging in again.
        </p>
        <Button onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPage;
