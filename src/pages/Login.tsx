import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthForm from "@/components/auth/AuthForm";
import SecretTestButton from "@/components/auth/SecretTestButton";

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

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-100 via-pink-100 to-orange-100">
      <div className="max-w-md w-full space-y-8">
        <AuthHeader />
        <AuthForm />
      </div>
      <SecretTestButton />
    </div>
  );
};

export default Login;