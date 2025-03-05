import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * Authentication Form Component
 * 
 * This component provides both sign in and sign up functionality.
 * It manages user authentication state, form submission, and navigation
 * to the dashboard upon successful authentication.
 * 
 * Updated with styling to match the landing page aesthetics.
 */
const AuthForm = ({ mode = "login", onSuccess }: AuthFormProps) => {
  // State for form fields and loading state
  const [formState, setFormState] = useState<AuthFormState>({
    email: "",
    password: "",
    errors: null,
    message: null,
    loading: false,
    redirectTo: getReturnToPath() || "/dashboard"
  });

  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  // Toast hook for displaying notifications
  const { toast } = useToast();

  // Helper function to get return path from URL query parameters
  function getReturnToPath() {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('returnTo');
      return returnTo ? decodeURIComponent(returnTo) : null;
    }
    return null;
  }

  // Listen for auth state changes - we're using the supabase client directly here
  // to ensure we're not depending on the context which might not be initialized properly
  useEffect(() => {
    console.log("[AuthForm] Setting up auth state change listener");
    
    // Guard against supabase being undefined
    if (!supabase || !supabase.auth) {
      console.error("[AuthForm] Supabase client or auth is not available");
      return;
    }
    
    // Subscribe to authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthForm] Auth state changed:", { event, sessionExists: !!session });
      
      // When user is signed in, navigate to the dashboard
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        console.log("[AuthForm] Valid session detected, navigating to dashboard");
        navigate("/dashboard", { replace: true });
      }
    });

    // Clean up the subscription when the component unmounts
    return () => {
      console.log("[AuthForm] Cleaning up auth state change listener");
      subscription?.unsubscribe?.();
    };
  }, [navigate]); // Only re-run if navigate changes
  
  // Form submission handler for both login and signup
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState({
      ...formState,
      errors: null,
      message: null,
      loading: true,
    });

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });

        if (error) throw error;
        
        console.log("[AuthForm] Login successful, navigating to:", formState.redirectTo);
        navigate(formState.redirectTo);
        
        if (onSuccess) {
          onSuccess(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formState.email,
          password: formState.password,
        });

        if (error) throw error;

        setFormState({
          ...formState,
          loading: false,
          message:
            "Success! Please check your email for a confirmation link.",
        });
        
        if (data.user && onSuccess) {
          onSuccess(data.user);
        }
      }
    } catch (error: any) {
      console.error("[AuthForm] Error:", error);
      setFormState({
        ...formState,
        loading: false,
        errors: {
          form: error.message || "An error occurred during authentication.",
        },
      });
    }
  };

  // Render the authentication form with updated styling
  return (
    <div className={cn(
      "mt-8 py-8 px-4 sm:rounded-lg sm:px-10", 
      "bg-white/80 backdrop-blur-sm",
      "shadow-xl rounded-2xl",
      "relative z-10"
    )}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            value={formState.email}
            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
            required
            className="mt-1"
            disabled={formState.loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={formState.password}
            onChange={(e) => setFormState({ ...formState, password: e.target.value })}
            required
            className="mt-1"
            disabled={formState.loading}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            type="submit" 
            className="w-full rounded-full" 
            disabled={formState.loading}
          >
            {formState.loading ? "Loading..." : mode === "login" ? "Sign in" : "Sign up"}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full"
            onClick={() => setFormState({ ...formState, mode: mode === "login" ? "signup" : "login" })}
            disabled={formState.loading}
          >
            {mode === "login" ? "Already have an account? Sign up" : "Need an account? Sign in"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
