
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component
 * 
 * Simplified version that handles authentication state with minimal logging.
 * Redirects unauthenticated users to login page.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, session } = useSessionContext();
  const user = useUser();
  const location = useLocation();

  // Basic loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect if user is not authenticated
  if (!user || !session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
