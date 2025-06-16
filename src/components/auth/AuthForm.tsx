
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
  
  // Form submission handler for login only
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
    </div>
  );
};

export default AuthForm;
