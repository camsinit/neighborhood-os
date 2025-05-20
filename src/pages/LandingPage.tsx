
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { HeroSection } from "@/components/ui/hero-section";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import { Button } from "@/components/ui/button";
import Features from "@/components/landing/Features"; 
import { ArrowRight } from "lucide-react";

/**
 * LandingPage component
 * 
 * The public-facing landing page that conditionally shows content based on
 * authentication status. Authenticated users see a welcome dashboard,
 * while non-authenticated users see the waitlist signup form.
 */
const LandingPage = () => {
  // Initialize the navigate function from React Router to handle redirections
  const navigate = useNavigate();

  // Get the user's session from Supabase Auth context
  const { session } = useSessionContext();
  
  // State to track if we're showing the authenticated view
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Track if component has mounted to prevent flashing content
  const [hasMounted, setHasMounted] = useState(false);

  // Check authentication status and update state
  // This effect runs when the component mounts and whenever session changes
  useEffect(() => {
    // Log for debugging purposes
    console.log("[LandingPage] Session state changed:", { 
      hasSession: !!session,
      userId: session?.user?.id,
      timestamp: new Date().toISOString()
    });
    
    // Update authentication state
    setIsAuthenticated(!!session);
    
    // Mark component as mounted
    setHasMounted(true);
  }, [session]);
  
  // Navigate directly to home if user is in deep-linked paths that require auth
  useEffect(() => {
    if (session && window.location.pathname === '/') {
      // Only perform auto-navigation if user is on the root path
      // and is authenticated - prevents unwanted redirects
      console.log("[LandingPage] Auto-navigating authenticated user to home page");
      navigate("/home", { replace: true });
    }
  }, [session, navigate]);
  
  // Log render to help with debugging navigation issues
  console.log("[LandingPage] Rendering:", { 
    isAuthenticated, 
    hasMounted,
    pathname: window.location.pathname
  });
  
  // Don't render anything during initial authentication check
  // This prevents content flashing during authentication check
  if (!hasMounted) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation header with logo and login/dashboard button */}
      <header className="w-full py-4 px-6 flex justify-between items-center">
        {/* Logo in the top left */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold">neighborhoodOS</h1>
        </div>
        
        {/* Dynamic button based on authentication status */}
        {isAuthenticated ? (
          // Dashboard button for authenticated users
          <Button asChild className="rounded-full">
            <Link to="/home" className="hover:bg-primary/90 transition-colors flex items-center gap-2">
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          // Login button for non-authenticated users
          <Button asChild className="rounded-full">
            <Link to="/login" className="hover:bg-primary/90 transition-colors">
              Login
            </Link>
          </Button>
        )}
      </header>
      
      {/* Conditional content based on authentication status */}
      {isAuthenticated ? (
        // Welcome message for authenticated users
        <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome back to neighborhoodOS!</h2>
          <p className="text-xl mb-8">You're already signed in. Continue to your neighborhood dashboard.</p>
          <Button asChild size="lg" className="rounded-full">
            <Link to="/home" className="flex items-center gap-2">
              Go to Dashboard <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      ) : (
        // Standard landing page for non-authenticated users
        <>
          {/* Hero section with waitlist form and app preview */}
          <HeroSection 
            title="neighborhoodOS" 
            description="The neighborhood operating system to create a caring neighborhood"
            actions={[]} 
            waitlistForm={<WaitlistForm />} 
            image={{
              src: "/lovable-uploads/f04070b4-dab4-46df-8af0-0d0960eb1119.png",
              alt: "Skills exchange platform preview"
            }} 
          />
          
          {/* Features section */}
          <Features />
        </>
      )}
    </div>
  );
};

export default LandingPage;
