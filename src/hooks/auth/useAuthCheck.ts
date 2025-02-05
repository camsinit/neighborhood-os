import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { logAuthCheck, logAuthError } from "@/utils/auth/authLogger";

export const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const checkAuth = async (mounted: boolean) => {
    try {
      logAuthCheck();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logAuthError(error, location);
        toast({
          title: "Authentication Error",
          description: `Error checking session: ${error.message}`,
          variant: "destructive",
        });
        
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/login', { 
            replace: true,
            state: { from: location }
          });
        }
        return;
      }

      if (!mounted) return;

      const hasSession = !!session;
      if (hasSession) {
        setIsAuthenticated(true);
        setIsLoading(false);
        
        const savedLocation = location.state?.from?.pathname;
        if (savedLocation && savedLocation !== '/login') {
          navigate(savedLocation, { replace: true });
        }
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/login', { 
          replace: true,
          state: { from: location }
        });
      }
    } catch (error) {
      console.error('Unexpected auth check error:', error);
      if (mounted) {
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/login', { 
          replace: true,
          state: { from: location }
        });
      }
    }
  };

  return {
    isAuthenticated,
    isLoading,
    checkAuth
  };
};