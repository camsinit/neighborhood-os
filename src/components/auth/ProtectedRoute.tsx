import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth check error:", error);
          navigate("/login");
          return;
        }

        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          navigate("/login");
          return;
        }

        if (!profile) {
          console.log("No profile found, redirecting to login");
          navigate("/login");
          return;
        }

        console.log("Auth check successful, profile found");
      } catch (error) {
        console.error("Unexpected error during auth check:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      <LoadingSpinner />
    </div>
  );
};

export default ProtectedRoute;