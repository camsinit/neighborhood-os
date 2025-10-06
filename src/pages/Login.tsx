
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import AuthForm from "@/components/auth/AuthForm";
import AuthHeader from "@/components/auth/AuthHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { BASE_ROUTES } from "@/utils/routes";
import { createLogger } from "@/utils/logger";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

/**
 * Login page component
 * 
 * This page displays the authentication form and header,
 * now styled to match our chat interface aesthetic.
 */
const Login = () => {
  // Logger for this page to avoid noisy console logs in production builds
  const logger = createLogger('Login');
  // Get navigation and session context
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();
  const isMobile = useIsMobile();
  
  // Redirect authenticated users to home page
  useEffect(() => {
    if (!isLoading && session) {
      logger.info("[Login] User is already authenticated, redirecting to home page");
      navigate(BASE_ROUTES.home, { replace: true });
    }
  }, [session, isLoading, navigate]);

  // If on mobile, show desktop recommendation notice instead of the login form
  if (isMobile) {
    logger.info("[Login] Mobile device detected - showing desktop recommendation notice");
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <Card className="w-full max-w-xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-semibold">
              neighborhoodOS is best experienced on desktop
            </CardTitle>
            <CardDescription className="mt-3 text-base">
              Revisit on desktop to check out neighborhoodOS. We'll optimize for mobile surfaces soon. Stay tuned.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {/* Intentionally left without video per request */}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button className="rounded-full" onClick={() => navigate("/")}>Return to homepage</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Improved styling to match our chat aesthetic
  return (
    <div className={cn(
      "min-h-screen relative", 
      "flex flex-col justify-center py-12 sm:px-6 lg:px-8",
      "bg-background text-foreground font-sans" // Added font-sans for consistency
    )}>
      {/* Back button in top right corner */}
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-20 bg-transparent hover:bg-background/10 text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

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
