
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading, session } = useSessionContext();
  const user = useUser();
  const location = useLocation();

  // Add more detailed logging to debug authentication issues
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

  if (isLoading) {
    console.log("[ProtectedRoute] Still loading authentication state, session context loading:", isLoading);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
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
