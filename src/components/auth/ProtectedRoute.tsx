
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading";
import { useEffect, useState } from "react";

/**
 * Protected Route Component
 * 
 * This component ensures that only authenticated users can access certain routes.
 * It shows a loading spinner while checking authentication and redirects
 * unauthenticated users to the login page.
 * 
 * Simplified for better reliability.
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Get authentication state from Supabase
  const { isLoading, session } = useSessionContext();
  const user = useUser();
  const location = useLocation();
  
  // Add timeout for loading state to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Set a timeout to prevent indefinite loading
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 3000); // 3 seconds timeout
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Basic logging of authentication state for debugging
  useEffect(() => {
    console.log("[ProtectedRoute] Auth state:", {
      isLoading,
      hasUser: !!user,
      hasSession: !!session,
      path: location.pathname,
    });
  }, [isLoading, user, session, location]);

  // Show loading spinner while checking auth status (with timeout)
  if (isLoading && !loadingTimeout) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Direct to login if no authenticated user
  if (!user || !session) {
    // If loading timed out or auth check complete but no user,
    // redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
