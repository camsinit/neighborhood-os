
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, session } = useSessionContext();
  const user = useUser();
  const location = useLocation();

  console.log("[ProtectedRoute] Current state:", {
    isLoading,
    hasUser: !!user,
    hasSession: !!session,
    currentPath: location.pathname,
    userId: user?.id,
    sessionUserId: session?.user?.id
  });

  if (isLoading) {
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
