import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import SurveyDialog from "@/components/onboarding/SurveyDialog";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const { toast } = useToast();

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
            setShowOnboarding(true);
          } else if (!profile?.display_name) {
            // If the user hasn't completed their profile, show the survey
            setShowSurvey(true);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Terrific Terrace
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect with your community
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
            localization={{
              variables: {
                sign_up: {
                  password_label: "Password (minimum 6 characters)",
                  password_input_placeholder: "Enter your password (min. 6 characters)",
                  email_label: "Email address",
                  email_input_placeholder: "Your email address",
                  button_label: "Sign up",
                  loading_button_label: "Signing up ...",
                  social_provider_text: "Sign in with {{provider}}",
                  link_text: "Don't have an account? Sign up",
                  confirmation_text: "Check your email for the confirmation link"
                },
                sign_in: {
                  password_label: "Password",
                  password_input_placeholder: "Enter your password",
                  email_label: "Email address",
                  email_input_placeholder: "Your email address",
                  button_label: "Sign in",
                  loading_button_label: "Signing in ...",
                  social_provider_text: "Sign in with {{provider}}",
                  link_text: "Already have an account? Sign in"
                }
              }
            }}
            onError={(error) => {
              let message = error.message;
              if (error.message.includes("User already registered")) {
                message = "This email is already registered. Please sign in instead.";
              }
              toast({
                title: "Error",
                description: message,
                variant: "destructive",
              });
            }}
          />
        </div>
      </div>
      <OnboardingDialog 
        open={showOnboarding} 
        onOpenChange={(open) => {
          setShowOnboarding(open);
          if (!open) {
            setShowSurvey(true);
          }
        }}
      />
      <SurveyDialog
        open={showSurvey}
        onOpenChange={setShowSurvey}
      />
    </div>
  );
};

export default Login;