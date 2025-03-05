
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading";
import { useEffect, useState } from "react";

/**
 * ProtectedRoute Component
 * 
 * This component protects routes that require authentication.
 * It handles loading states and redirects unauthenticated users.
 * 
 * @param children - The components to render if the user is authenticated
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Get authentication state from Supabase
  const { isLoading, session } = useSessionContext();
  const user = useUser();
  const location = useLocation();
  
  // Add state to handle initial loading with a delay for better UX
  const [showLoading, setShowLoading] = useState(false);
  
  // Only show the loading spinner after a short delay to prevent flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowLoading(true);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Reset loading state when not loading anymore
  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false);
    }
  }, [isLoading]);

  // Add detailed logging for debugging
  useEffect(() => {
    console.log("[ProtectedRoute] Component mounted/updated:", {
      isLoading,
      hasUser: !!user,
      hasSession: !!session,
      currentPath: location.pathname,
      userId: user?.id,
      sessionUserId: session?.user?.id
    });
  }, [isLoading, user, session, location.pathname]);

  // Handle loading state
  if (isLoading) {
    console.log("[ProtectedRoute] Still loading authentication state, session context loading:", isLoading);
    
    // Only show loading spinner if we've been loading for more than the delay
    if (showLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      );
    }
    
    // Return an empty div during the initial delay
    return <div className="min-h-screen"></div>;
  }

  // If not authenticated, redirect to login
  if (!user || !session) {
    console.log("[ProtectedRoute] No authenticated user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  console.log("[ProtectedRoute] User authenticated, rendering protected content", {
    userId: user.id,
    sessionId: session.user.id
  });
  
  return <>{children}</>;
};

export default ProtectedRoute;
