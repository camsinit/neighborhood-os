import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useLoginState = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    console.log('Starting profile fetch for user:', userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      console.log('Profile fetch successful:', {
        hasProfile: !!profile,
        userId,
        timestamp: new Date().toISOString()
      });

      return profile;
    } catch (error) {
      console.error('Unexpected error in fetchProfile:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('Login state management initialized');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change in Login page:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });

      if (event === 'SIGNED_IN' && session) {
        try {
          await fetchProfile(session.user.id);
          
          // Navigate to dashboard after successful profile fetch
          console.log('Navigating to dashboard after successful login');
          navigate('/dashboard', { replace: true });
          
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        } catch (error) {
          console.error('Error during login flow:', error);
          toast({
            title: "Error",
            description: "There was an issue signing you in. Please try again.",
            variant: "destructive",
          });
        }
      }
    });

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session check error:', error);
        return;
      }

      if (session) {
        console.log('Existing session found, navigating to dashboard');
        navigate('/dashboard', { replace: true });
      }
    });

    return () => {
      console.log('Login state management cleanup');
      subscription.unsubscribe();
    };
  }, [navigate, toast]);
};