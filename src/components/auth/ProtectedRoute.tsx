
/**
 * ProtectedRoute component
 * 
 * Ensures routes are only accessible to authenticated users.
 * Displays a loading spinner while authentication is being checked.
 */
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Get authentication state from Supabase Auth Helpers
  const { isLoading: isLoadingAuth, session } = useSessionContext();
  const user = useUser();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Verifying your account...</p>
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
  
  // User is authenticated, render the protected content
  console.log("[ProtectedRoute] User authenticated, rendering protected content", {
    userId: user.id,
    path: location.pathname,
    timestamp: new Date().toISOString()
  });
  
  return <>{children}</>;
};

export default ProtectedRoute;
