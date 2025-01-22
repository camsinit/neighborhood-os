import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, AuthError as SupabaseAuthError, AuthChangeEvent } from "@supabase/supabase-js";
import AuthUI from "./AuthUI";
import AuthErrorComponent from "./AuthError";
import AuthOnboarding from "./AuthOnboarding";

const AuthForm = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('Current origin:', window.location.origin);

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
        case 'USER_DELETED':
          console.log('User deleted');
          break;
      }

      // Handle sign up outside of switch statement
      if (event === 'SIGNED_UP') {
        setShowOnboarding(true);
        console.log('User signed up');
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
      <AuthErrorComponent error={error} />
      <AuthUI />
      <AuthOnboarding 
        showOnboarding={showOnboarding}
        onOpenChange={setShowOnboarding}
      />
    </>
  );
};

export default AuthForm;