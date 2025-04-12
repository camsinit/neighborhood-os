import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import AuthForm from "@/components/auth/AuthForm";
import AuthHeader from "@/components/auth/AuthHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Login page component
 * 
 * This page displays the authentication form and header,
 * now styled to match our chat interface aesthetic.
 */
const Login = () => {
  // Get navigation and session context
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();
  
  // Redirect authenticated users to home page
  useEffect(() => {
    if (!isLoading && session) {
      console.log("[Login] User is already authenticated, redirecting to home page");
      navigate("/home", { replace: true });
    }
  }, [session, isLoading, navigate]);

  // Improved styling to match our chat aesthetic
  return (
    <div className={cn(
      "min-h-screen relative", 
      "flex flex-col justify-center py-12 sm:px-6 lg:px-8",
      "bg-background text-foreground font-sans" // Added font-sans for consistency
    )}>
      {/* 
        Background gradient with more subtle styling to match chat interface
      */}
      <div 
        className="absolute inset-0 opacity-5 filter blur-[100px]" 
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)), #10b981, #8b5cf6)",
          zIndex: 0
        }}
      />

      {/* Back button with styling consistent with chat interface */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 relative z-10">
        <Button asChild variant="ghost" size="sm" className="mb-4 rounded-lg">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      {/* Auth form container with updated styling to match chat interface */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* AuthHeader component */}
        <AuthHeader />
        
        {/* Directly render AuthForm without an extra div */}
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
