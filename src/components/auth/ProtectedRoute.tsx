
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, session } = useSessionContext();
  const user = useUser();
  const location = useLocation();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  console.log("[ProtectedRoute] Current state:", {
    isLoading,
    hasUser: !!user,
    hasSession: !!session,
    currentPath: location.pathname,
    userId: user?.id,
    sessionUserId: session?.user?.id
  });

  // Add a timeout to automatically stop showing the loading spinner
  // after a reasonable amount of time
  useEffect(() => {
    // Set a timeout to stop showing loading state after 3 seconds
    const timeoutId = setTimeout(() => {
      if (isInitialLoading) {
        console.log("[ProtectedRoute] Forcing loading state to complete after timeout");
        setIsInitialLoading(false);
      }
    }, 3000);

    // If actual loading completes, immediately mark initial loading as done
    if (!isLoading) {
      setIsInitialLoading(false);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading, isInitialLoading]);

  if (isLoading && isInitialLoading) {
    console.log("[ProtectedRoute] Still loading authentication state, session context loading:", isLoading);
    return <LoadingSpinner />;
  }

  if (!user || !session) {
    console.log("[ProtectedRoute] No authenticated user found, redirecting to login", {
      hasUser: !!user,
      hasSession: !!session
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("[ProtectedRoute] User authenticated, rendering protected content", {
    userId: user.id,
    sessionId: session.user.id
  });
  
  return <>{children}</>;
};

export default ProtectedRoute;
