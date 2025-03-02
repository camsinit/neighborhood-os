
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Authentication Form Component
 * 
 * This component provides both sign in and sign up functionality.
 * It manages user authentication state, form submission, and navigation
 * to the dashboard upon successful authentication.
 */
const AuthForm = () => {
  // State for form fields and loading state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  // Toast hook for displaying notifications
  const { toast } = useToast();

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("[AuthForm] Starting authentication process", { isSignUp });

    try {
      if (isSignUp) {
        // Signup process
        console.log("[AuthForm] Attempting signup");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) throw error;
        console.log("[AuthForm] Signup successful");

        toast({
          title: "Check your email",
          description: "We've sent you a verification link",
        });
      } else {
        // Signin process
        console.log("[AuthForm] Attempting signin");
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("[AuthForm] Signin error:", error);
          if (error.message.includes('credentials')) {
            toast({
              title: "Invalid credentials",
              description: "Please check your email and password",
              variant: "destructive",
            });
          } else {
            throw error;
          }
          return;
        }

        console.log("[AuthForm] Signin successful", { user: data.user?.id });
        
        // Show success toast
        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        });
        
        // No need to navigate here as the auth state change listener will handle that
      }
    } catch (error: any) {
      console.error("[AuthForm] Authentication error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      console.log("[AuthForm] Completing authentication process");
      setIsLoading(false);
    }
  };

  // Render the authentication form
  return (
    <div className="mt-8 bg-white/80 backdrop-blur-sm py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : isSignUp ? "Sign up" : "Sign in"}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
