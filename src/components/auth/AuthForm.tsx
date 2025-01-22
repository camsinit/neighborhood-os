import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import SurveyDialog from "@/components/onboarding/SurveyDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, Session, AuthChangeEvent } from "@supabase/supabase-js";

const AuthForm = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectTo = window.location.origin;
  
  useEffect(() => {
    console.log('Current origin:', window.location.origin);
    console.log('Redirect URL:', redirectTo);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth state change event:', event);
      switch (event) {
        case 'SIGNED_IN':
          console.log('Sign in successful');
          break;
        case 'SIGNED_OUT':
          console.log('Sign out successful');
          break;
        case 'USER_UPDATED':
          console.log('User updated');
          break;
        case 'PASSWORD_RECOVERY':
          console.log('Password recovery initiated');
          break;
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed');
          break;
        case 'MFA_CHALLENGE_VERIFIED':
          console.log('MFA challenge verified');
          break;
        case 'INITIAL_SESSION':
          console.log('Initial session loaded');
          break;
        case 'SIGNED_UP':
          setShowOnboarding(true);
          console.log('User signed up');
          break;
      }
    });

    // Test the Supabase connection
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setError(error.message);
      } else {
        console.log('Session retrieved successfully:', data);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
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