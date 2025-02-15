
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading } = useSessionContext();
  const user = useUser();
  const location = useLocation();

  console.log("[ProtectedRoute] Current state:", {
    isLoading,
    hasUser: !!user,
    currentPath: location.pathname,
    userId: user?.id
  });

  if (isLoading) {
    console.log("[ProtectedRoute] Still loading authentication state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    console.log("[ProtectedRoute] No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("[ProtectedRoute] User authenticated, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
