
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import AuthForm from "@/components/auth/AuthForm";
import AuthHeader from "@/components/auth/AuthHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils"; // Import cn utility

/**
 * Login page component
 * 
 * This page displays the authentication form and header,
 * allowing users to sign in to access the Neighborhood OS dashboard.
 * It also redirects authenticated users to the dashboard.
 * 
 * Updated with consistent styling to match the landing page hero section.
 */
const Login = () => {
  // Get navigation and session context
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    // Only redirect if we're not loading AND we have a session
    if (!isLoading && session) {
      console.log("[Login] User is already authenticated, redirecting to dashboard");
      // Use replace to prevent going back to login page after redirection
      navigate("/dashboard", { replace: true });
    }
  }, [session, isLoading, navigate]);

  // If still loading or user is not authenticated, show the login page with updated styling
  return (
    // Added relative class to position the gradient background
    <div className={cn(
      "min-h-screen relative", 
      "flex flex-col justify-center py-12 sm:px-6 lg:px-8",
      "bg-background text-foreground" // Match theme with landing page
    )}>
      {/* 
        Adding the diffused rainbow gradient background similar to hero section
        with increased blur and reduced opacity 
      */}
      <div 
        className="absolute inset-0 opacity-10 filter blur-[120px]" 
        style={{
          background: "linear-gradient(135deg, #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6, #ec4899, #06b6d4)",
          zIndex: 0
        }}
      />

      {/* Back button to return to landing page - now with relative z-index to appear above gradient */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 relative z-10">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      {/* Auth form container with updated styling to match landing page */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* AuthHeader component */}
        <AuthHeader />
        
        {/* AuthForm with shadow and backdrop blur to match landing page aesthetics */}
        <div className="relative px-8 pb-8">
          {/* Rainbow gradient effect behind the form - made more diffused */}
          <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6, #ec4899, #06b6d4)",
              transform: "scale(1.05)", // Slightly larger than the container
              zIndex: 0
            }}
          />
          
          {/* AuthForm with proper positioning to appear above gradient */}
          <div className="relative z-10">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
