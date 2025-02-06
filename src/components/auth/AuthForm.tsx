import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import SurveyDialog from "@/components/onboarding/SurveyDialog";
import { useAuthState } from "@/hooks/auth/useAuthState";
import { useToast } from "@/hooks/use-toast";

const AuthForm = () => {
  const redirectTo = `${window.location.origin}/dashboard`;
  const { toast } = useToast();
  const { 
    showOnboarding, 
    setShowOnboarding, 
    showSurvey, 
    setShowSurvey 
  } = useAuthState(redirectTo);

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
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
              },
            },
          }}
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