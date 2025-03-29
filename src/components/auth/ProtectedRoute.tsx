
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

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Get authentication state from Supabase Auth Helpers
  const { isLoading: isLoadingAuth, session } = useSessionContext();
  const user = useUser();
  const location = useLocation();
  
  // Get neighborhood status
  const { currentNeighborhood, isLoading: isLoadingNeighborhood } = useNeighborhood();

  // Show loading spinner while checking authentication and neighborhood
  if (isLoadingAuth || (isLoadingNeighborhood && user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">
            {isLoadingAuth ? "Verifying your account..." : "Loading your neighborhood..."}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please wait while we prepare your dashboard.
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!user || !session) {
    console.log("[ProtectedRoute] User not authenticated, redirecting to login", {
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If user has no neighborhood, redirect to join page
  // Only apply this check to pages that require a neighborhood
  if (!currentNeighborhood && !location.pathname.includes('/join')) {
    console.log("[ProtectedRoute] User has no neighborhood, redirecting to join page", {
      userId: user.id,
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
    return <Navigate to="/join" replace />;
  }
  
  // User is authenticated and has necessary data, render the protected content
  console.log("[ProtectedRoute] User authenticated, rendering protected content", {
    userId: user.id,
    neighborhoodId: currentNeighborhood?.id,
    path: location.pathname,
    timestamp: new Date().toISOString()
  });
  
  return <>{children}</>;
};

export default ProtectedRoute;
