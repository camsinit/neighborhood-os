import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useAuthState = (redirectTo: string) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", { event, hasSession: !!session });

        if (event === "SIGNED_IN" && session) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profileError) {
              throw profileError;
            }

            if (!profile) {
              setShowOnboarding(true);
            }

            navigate(redirectTo);
          } catch (error) {
            console.error("Error handling auth state change:", error);
            toast({
              title: "Error",
              description: "There was a problem signing you in",
              variant: "destructive",
            });
          }
        }

        if (event === "SIGNED_OUT") {
          navigate("/login");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, redirectTo, toast]);

  return {
    showOnboarding,
    setShowOnboarding,
    showSurvey,
    setShowSurvey
  };
};