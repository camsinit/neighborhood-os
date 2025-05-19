
/**
 * ProtectedRoute component
 * 
 * Ensures routes are only accessible to authenticated users.
 * Displays a loading spinner while authentication is being checked.
 */
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useNeighborhood } from "@/contexts/neighborhood";

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

  // Debug info - this helps us track auth and routing issues
  console.log("[ProtectedRoute] Checking route access:", {
    path: location.pathname,
    isLoadingAuth,
    isLoadingNeighborhood,
    hasUser: !!user,
    hasNeighborhood: !!currentNeighborhood,
    neighborhoodError: error ? true : false,
    timestamp: new Date().toISOString()
  });

  // Show loading spinner while checking authentication and neighborhood
  if (isLoadingAuth || (isLoadingNeighborhood && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isLoadingAuth ? "Verifying your account..." : "Loading your neighborhood..."}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!user || !session) {
    console.log("[ProtectedRoute] User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Handle special cases for join pages to avoid infinite loops
  const isJoinPage = location.pathname === '/join' || location.pathname.startsWith('/join/');
  const isHomePage = location.pathname === '/home'; 
  const isOnboardingPage = location.pathname === '/onboarding';
  
  // If user has no neighborhood and trying to access a page that requires one,
  // redirect to join page - except for the join page itself, home page, and onboarding to avoid loops
  if (!currentNeighborhood && !isJoinPage && !isHomePage && !isOnboardingPage) {
    console.log("[ProtectedRoute] User has no neighborhood, redirecting to join page");
    return <Navigate to="/join" replace />;
  }

  // User is authenticated and has necessary data, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
