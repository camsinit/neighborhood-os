import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading";
import { useAuthCheck } from "@/hooks/auth/useAuthCheck";
import { useAuthStateChange } from "@/hooks/auth/useAuthStateChange";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthCheck();

  useEffect(() => {
    let mounted = true;
    checkAuth(mounted);
    return () => { mounted = false; };
  }, [checkAuth]);

  useAuthStateChange(
    (value) => isAuthenticated !== value && checkAuth(true),
    () => {}
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;