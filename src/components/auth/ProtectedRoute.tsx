
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoading } = useSessionContext();
  const user = useUser();

  if (isLoading) {
    return null; // Or a loading spinner if you prefer
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
