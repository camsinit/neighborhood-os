import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import SurveyDialog from "@/components/onboarding/SurveyDialog";
import { useToast } from "@/components/ui/use-toast";

const AuthForm = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const { toast } = useToast();
  const redirectTo = `${window.location.origin}/dashboard`;
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_UP') {
        setShowOnboarding(true);
      } else if (event === 'USER_UPDATED') {
        console.log('User updated:', session);
      } else if (event === 'SIGNED_IN') {
        console.log('Signed in:', session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <div className="mt-8 bg-white/80 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#000000',
                  brandAccent: '#222222',
                },
              },
            },
          }}
          providers={[]}
          redirectTo={redirectTo}
          onError={(error) => {
            console.error('Auth error:', error);
            toast({
              title: "Authentication Error",
              description: error.message,
              variant: "destructive",
            });
          }}
          localization={{
            variables: {
              sign_up: {
                password_label: "Password (minimum 6 characters)",
                password_input_placeholder: "Enter your password (min. 6 characters)",
                email_label: "Email address",
                email_input_placeholder: "Your email address",
                button_label: "Sign up",
                loading_button_label: "Signing in ...",
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
          showLinks={true}
        />
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
    </>
  );
};

export default AuthForm;