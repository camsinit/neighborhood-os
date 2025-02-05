import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import SurveyDialog from "@/components/onboarding/SurveyDialog";
import { useToast } from "@/components/ui/use-toast";
import type { AuthChangeEvent, Session, AuthError } from "@supabase/supabase-js";

const AuthForm = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const { toast } = useToast();
  const redirectTo = `${window.location.origin}/dashboard`;
  
  useEffect(() => {
    console.log('AuthForm mounted, setting up auth state change listener');
    console.log('Redirect URL configured as:', redirectTo);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          timestamp: new Date().toISOString()
        });

        if (event === 'SIGNED_IN') {
          console.log('Sign in successful:', {
            userId: session?.user?.id,
            email: session?.user?.email,
            aud: session?.user?.aud,
            lastSignInAt: session?.user?.last_sign_in_at
          });
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'USER_UPDATED') {
          console.log('User profile updated');
        }

        if (event === 'SIGNED_UP' as AuthChangeEvent) {
          console.log('New user signed up:', {
            userId: session?.user?.id,
            email: session?.user?.email
          });
          setShowOnboarding(true);
        }
      }
    );

    // Test auth state on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        error: error?.message,
        timestamp: new Date().toISOString()
      });
    });

    return () => {
      console.log('AuthForm unmounting, cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthError = (error: AuthError) => {
    console.error('Authentication error:', {
      message: error.message,
      status: error.status,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    toast({
      title: "Authentication Error",
      description: error.message,
      variant: "destructive",
    });
  };

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
          onError={handleAuthError}
          localization={{
            variables: {
              sign_up: {
                password_label: "Password (minimum 6 characters)",
                password_input_placeholder: "Enter your password (min. 6 characters)",
                email_label: "Email address",
                email_input_placeholder: "Your email address",
                button_label: "Sign up",
                loading_button_label: "Creating account...",
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
                loading_button_label: "Signing in...",
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