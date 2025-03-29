
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading";

/**
 * Index Page
 * 
 * This is a simplified landing page that redirects authenticated users to the dashboard
 * and unauthenticated users to the landing page.
 */
const Index = () => {
  const { isLoading, session } = useSessionContext();
  const navigate = useNavigate();
  
  // Redirect based on authentication status
  useEffect(() => {
    if (!isLoading) {
      if (session) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isLoading, session, navigate]);

  // Show loading while authentication state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // This should rarely be seen since we redirect above
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Header onOpenSettings={() => {}} />
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>
        <p className="mb-6">Please wait while we redirect you...</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/login")}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
          <Button onClick={() => navigate("/")} variant="outline">
            Go to Home
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
