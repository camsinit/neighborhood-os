
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PasswordInput } from "./PasswordInput";

/**
 * Authentication Form Component
 * 
 * This component provides both sign in and sign up functionality.
 * It manages user authentication state, form submission, and navigation
 * to the dashboard entry point upon successful authentication, which then handles
 * proper routing based on user status.
 * 
 * Updated with styling to match the landing page aesthetics.
 */
const AuthForm = () => {
  // State for form fields and loading state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); // Inline error instead of toast
  
  // Hook for programmatic navigation
  const navigate = useNavigate();
  
  // Toast hook for displaying notifications - only for critical errors
  const { toast } = useToast();

  // Listen for auth state changes
  useEffect(() => {
    console.log("[AuthForm] Setting up auth state change listener");
    
    if (!supabase || !supabase.auth) {
      console.error("[AuthForm] Supabase client or auth is not available");
      return;
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthForm] Auth state changed:", { event, sessionExists: !!session });
      
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        console.log("[AuthForm] Valid session detected, navigating to dashboard entry point");
        navigate("/dashboard", { replace: true });
      }
    });

    return () => {
      console.log("[AuthForm] Cleaning up auth state change listener");
      subscription?.unsubscribe?.();
    };
  }, [navigate]);
  
  // Form submission handler for email/password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setIsLoading(true);
    console.log("[AuthForm] Starting authentication process");

    try {
      console.log("[AuthForm] Attempting signin");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[AuthForm] Signin error:", error);
        if (error.message.includes('credentials')) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError(error.message);
        }
        return;
      }

      console.log("[AuthForm] Signin successful", { user: data.user?.id });
      // No success toast needed - navigation indicates success
      
    } catch (error: any) {
      console.error("[AuthForm] Authentication error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      console.log("[AuthForm] Completing authentication process");
      setIsLoading(false);
    }
  };

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    console.log("[AuthForm] Starting Google authentication");

    try {
      // Store OAuth destination for callback processing
      localStorage.setItem('oauthDestination', 'dashboard');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error("[AuthForm] Google signin error:", error);
        setError(error.message);
        setIsLoading(false);
        return;
      }

      console.log("[AuthForm] Google signin initiated");
      // Don't set loading to false here - user will be redirected
      
    } catch (error: any) {
      console.error("[AuthForm] Google authentication error:", error);
      setError("An unexpected error occurred with Google Sign-in. Please try again.");
      setIsLoading(false);
    }
  };

  // Function to handle redirecting to homepage/waitlist
  const handleWaitlistRedirect = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className={cn(
      "mt-8 py-8 px-4 sm:rounded-lg sm:px-10", 
      "bg-white/80 backdrop-blur-sm",
      "shadow-xl rounded-2xl",
      "relative z-10"
    )}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Show inline error message instead of toast */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
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
          <div className="mt-1">
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              disabled={isLoading}
              showValidation={false} // Simple mode for sign-in
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button 
            type="submit" 
            className="w-full rounded-full" 
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Sign in"}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full"
            onClick={handleWaitlistRedirect}
            disabled={isLoading}
          >
            Need an account? Join the Waitlist!
          </Button>
        </div>
      </form>
      
      {/* Divider */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
      </div>
      
      {/* Google Sign-in Button */}
      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full border-gray-300 hover:bg-gray-50"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLoading ? "Loading..." : "Sign in with Google"}
        </Button>
      </div>
    </div>
  );
};

export default AuthForm;
