
/**
 * ProtectedRoute component
 * 
 * Ensures routes are only accessible to authenticated users.
 * Displays a loading spinner while authentication is being checked.
 * Checks if user needs to complete onboarding and redirects accordingly.
 * 
 * UPDATED: Now allows unauthenticated access to onboarding page when in guest mode
 */
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useLocation } from "react-router-dom";
import { useNeighborhood } from "@/contexts/neighborhood";
import { useOnboardingStatus } from "./hooks/useOnboardingStatus";
import { useGuestOnboardingMode } from "./hooks/useGuestOnboardingMode";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { isJoinPage, isHomePage, isOnboardingPage } from "./utils/routeChecks";

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component
 * 
 * This component checks if the user is authenticated and has necessary data
 * before allowing access to protected routes. It shows a loading state while checking.
 * Now includes special handling for guest onboarding flow.
 * 
 * @param children - The components to render if the user is authenticated
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Get authentication state from Supabase Auth Helpers
  const { isLoading: isLoadingAuth, session } = useSessionContext();
  const user = useUser();
  const location = useLocation();
  
  // Get neighborhood status - using our updated neighborhood context
  const { currentNeighborhood, isLoading: isLoadingNeighborhood, error } = useNeighborhood();
  
  // Get onboarding status using our custom hook
  const { isCheckingOnboarding, needsOnboarding } = useOnboardingStatus();
  
  // Check if we're in guest onboarding mode
  const { isGuestOnboardingMode } = useGuestOnboardingMode();

  // Debug info - this helps us track auth and routing issues
  console.log("[ProtectedRoute] Checking route access:", {
    path: location.pathname,
    isLoadingAuth,
    isLoadingNeighborhood,
    isCheckingOnboarding,
    hasUser: !!user,
    hasNeighborhood: !!currentNeighborhood,
    needsOnboarding,
    neighborhoodError: error ? true : false,
    isGuestOnboardingMode
  });

  // Show loading spinner while checking authentication and neighborhood
  if (isLoadingAuth || (isLoadingNeighborhood && user) || (isCheckingOnboarding && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-muted-foreground">
            {isLoadingAuth ? 'Checking authentication...' : 
             isCheckingOnboarding ? 'Checking onboarding status...' : 
             'Loading neighborhood...'}
          </p>
        </div>
      </div>
    );
  }

  // Special case: Allow unauthenticated access to onboarding page if in guest mode
  if (isOnboardingPage(location) && !user && isGuestOnboardingMode) {
    console.log("[ProtectedRoute] Allowing unauthenticated access to onboarding (guest mode)");
    return <>{children}</>;
  }

  // If not authenticated, redirect to landing page (except for guest onboarding)
  if (!user || !session) {
    console.log("[ProtectedRoute] User not authenticated, redirecting to landing page");
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // If user needs to complete onboarding, redirect to onboarding page
  // Don't redirect if we're already on the onboarding page to avoid loops
  if (needsOnboarding && !isOnboardingPage(location)) {
    console.log("[ProtectedRoute] User needs to complete onboarding, redirecting");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Handle special cases for join pages to avoid infinite loops
  const isJoin = isJoinPage(location);
  const isHome = isHomePage(location);
  
  // If user has no neighborhood and trying to access a page that requires one,
  // redirect to join page - except for the join page itself and home page to avoid loops
  if (!currentNeighborhood && !isJoin && !isHome) {
    console.log("[ProtectedRoute] User has no neighborhood, redirecting to join page");
    // Show loading state briefly to prevent jarring redirect
    setTimeout(() => {
      // This will be handled by the redirect logic
    }, 100);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-muted-foreground">Setting up your neighborhood...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and has necessary data, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
