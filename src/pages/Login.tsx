
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import AuthForm from "@/components/auth/AuthForm";
import AuthHeader from "@/components/auth/AuthHeader";
import { cn } from "@/lib/utils";
import createNavigationLogger from "@/utils/navigationLogger";

/**
 * Login page component
 * 
 * This page displays the authentication form and header,
 * styled to match our chat interface aesthetic.
 */
const Login = () => {
  // Get navigation and session context
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();
  
  // Create navigation logger for this component
  const logNavigation = createNavigationLogger("Login");
  
  // Redirect authenticated users to home page
  useEffect(() => {
    if (!isLoading && session) {
      // Always use the standardized /home path, not /dashboard
      logNavigation("/home", { 
        replace: true, 
        cause: "Already authenticated",
        authState: "authenticated"
      });
      
      console.log("[Login] User is already authenticated, redirecting to home page");
      navigate("/home", { replace: true });
    }
  }, [session, isLoading, navigate, logNavigation]);

  // Improved styling to match our chat aesthetic
  return (
    <div className={cn(
      "min-h-screen relative", 
      "flex flex-col justify-center py-12 sm:px-6 lg:px-8",
      "bg-background text-foreground font-sans" // Added font-sans for consistency
    )}>
      {/* 
        Background gradient with blue tones to match the original aesthetic
      */}
      <div 
        className="absolute inset-0 opacity-10 filter blur-[120px]" 
        style={{
          background: "linear-gradient(135deg, #0EA5E9, #33C3F0, #1EAEDB)", // Using ocean blue and sky blue tones
          zIndex: 0
        }}
      />
      
      {/* Auth form container with updated styling to match chat interface */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* AuthHeader component */}
        <AuthHeader />
        
        {/* Directly render AuthForm */}
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
