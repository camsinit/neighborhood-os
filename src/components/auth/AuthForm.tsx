import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

const AuthForm = () => {
  return (
    <div className="mt-8 bg-white/80 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
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
  );
};

export default AuthForm;