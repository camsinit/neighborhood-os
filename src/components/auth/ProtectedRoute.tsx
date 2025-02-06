import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading";
import { useAuthCheck } from "@/hooks/auth/useAuthCheck";
import { useAuthStateChange } from "@/hooks/auth/useAuthStateChange";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, checkAuth } = useAuthCheck();

  useEffect(() => {
    console.log("ProtectedRoute: Checking auth status", {
      isAuthenticated,
      isLoading,
      timestamp: new Date().toISOString()
    });
    
    let mounted = true;
    
    const check = async () => {
      await checkAuth(mounted);
      
      if (!isAuthenticated && !isLoading) {
        console.log("ProtectedRoute: Not authenticated, redirecting to login");
        navigate("/login");
      }
    };
    
    check();
    
    return () => { mounted = false; };
  }, [checkAuth, isAuthenticated, isLoading, navigate]);

  useAuthStateChange(
    (value) => {
      console.log("ProtectedRoute: Auth state changed", {
        newValue: value,
        currentValue: isAuthenticated,
        timestamp: new Date().toISOString()
      });
      if (isAuthenticated !== value) {
        checkAuth(true);
      }
    },
    () => {}
  );

  if (isLoading) {
    console.log("ProtectedRoute: Still loading...");
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, rendering null");
    return null;
  }

  console.log("ProtectedRoute: Authenticated, rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;