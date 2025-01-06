import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthForm from "@/components/auth/AuthForm";
import SecretTestButton from "@/components/auth/SecretTestButton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        if (session) {
          // Check if this is a new user (first sign in)
          const { data: profile } = await supabase
            .from('profiles')
            .select('created_at, display_name')
            .eq('id', session.user.id)
            .single();

          // If the profile was just created (within the last minute), show onboarding
          if (profile && new Date(profile.created_at).getTime() > Date.now() - 60000) {
            navigate("/");
          } else if (!profile?.display_name) {
            // If the user hasn't completed their profile, show the survey
            navigate("/");
          } else {
            navigate("/");
          }
        }
      } else if (event === 'SIGNED_OUT') {
        navigate("/login");
      }
    });

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleBackClick = () => {
    // Force navigation to root without auth check
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F1F0FB] via-[#D3E4FD] to-[#F2FCE2]">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 flex items-center gap-2"
        onClick={handleBackClick}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
      <div className="max-w-md w-full space-y-8">
        <AuthHeader />
        <AuthForm />
      </div>
      <SecretTestButton />
    </div>
  );
};

export default Login;