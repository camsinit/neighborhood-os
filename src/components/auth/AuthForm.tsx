import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import SurveyDialog from "@/components/onboarding/SurveyDialog";
import { useToast } from "@/hooks/use-toast";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

const AuthForm = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const { toast } = useToast();
  const redirectTo = `${window.location.origin}/dashboard`;
  
  useEffect(() => {
    console.log('AuthForm mounted, setting up auth state change listener');
    console.log('Redirect URL configured as:', redirectTo);
    console.log('Current origin:', window.location.origin);
    console.log('Current pathname:', window.location.pathname);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          timestamp: new Date().toISOString(),
          currentPath: window.location.pathname,
          accessToken: session?.access_token ? 'Present' : 'Missing',
          refreshToken: session?.refresh_token ? 'Present' : 'Missing',
          expiresAt: session?.expires_at
        });

        if (event === 'SIGNED_IN') {
          console.log('Sign in successful:', {
            userId: session?.user?.id,
            email: session?.user?.email,
            aud: session?.user?.aud,
            lastSignInAt: session?.user?.last_sign_in_at,
            expiresIn: session?.expires_in,
            tokenDetails: {
              accessTokenPresent: !!session?.access_token,
              refreshTokenPresent: !!session?.refresh_token,
              expiresAt: session?.expires_at
            }
          });

          // Check if session is actually valid
          const { data: sessionCheck, error: sessionError } = await supabase.auth.getSession();
          console.log('Session validation check:', {
            hasValidSession: !!sessionCheck.session,
            sessionError: sessionError?.message,
            timestamp: new Date().toISOString()
          });

          if (sessionError) {
            console.error('Session validation failed:', sessionError);
            toast({
              title: "Authentication Error",
              description: `Session validation failed: ${sessionError.message}`,
              variant: "destructive",
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'USER_UPDATED') {
          console.log('User profile updated');
        }

        if (event === 'SIGNED_UP' as AuthChangeEvent) {
          console.log('New user signed up:', {
            userId: session?.user?.id,
            email: session?.user?.email,
            timestamp: new Date().toISOString()
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
        timestamp: new Date().toISOString(),
        currentPath: window.location.pathname
      });

      if (error) {
        console.error('Session check error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        toast({
          title: "Session Check Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });

    return () => {
      console.log('AuthForm unmounting, cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [toast]);

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