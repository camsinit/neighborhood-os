import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logAuthStateChange } from "@/utils/auth/authLogger";

export const useAuthStateChange = (
  setIsAuthenticated: (value: boolean) => void,
  setIsLoading: (value: boolean) => void
) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logAuthStateChange(event, session);

      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        setIsLoading(false);
        
        const savedLocation = location.state?.from?.pathname;
        if (savedLocation && savedLocation !== '/login') {
          navigate(savedLocation, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/login', { 
          replace: true,
          state: { from: location }
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location, setIsAuthenticated, setIsLoading]);
};