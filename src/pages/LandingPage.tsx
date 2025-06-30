
import { useSessionContext } from "@supabase/auth-helpers-react";
import { HeroSection } from "@/components/ui/hero-section";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import { Button } from "@/components/ui/button";
import Features from "@/components/landing/Features";
import { Link } from "react-router-dom";

/**
 * LandingPage component
 * 
 * The public-facing landing page with a waitlist signup form,
 * hero image showcasing the application, and features section.
 * This is now accessible to both authenticated and unauthenticated users.
 * Authenticated users see a "Dashboard" button, while unauthenticated users see "Login".
 */
const LandingPage = () => {
  // Get the user's session from Supabase Auth context
  const { session } = useSessionContext();
  
  // Log the current authentication state for debugging
  console.log("[LandingPage] Current session state:", { 
    isAuthenticated: !!session,
    userId: session?.user?.id 
  });
  
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation header with logo and conditional login/dashboard button */}
      <header className="w-full py-4 px-6 flex justify-between items-center">
        {/* Logo in the top left */}
        <div className="flex items-center">
          
        </div>
        
        {/* Conditional button - Dashboard for authenticated users, Login for unauthenticated */}
        <Button asChild className="rounded-full">
          {session ? (
            <Link to="/dashboard" className="hover:bg-primary/90 transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="hover:bg-primary/90 transition-colors">
              Login
            </Link>
          )}
        </Button>
      </header>
      
      {/* Hero section with waitlist form and app preview */}
      <HeroSection 
        title="neighborhoodOS" 
        description="The neighborhood operating system to create a caring neighborhood"
        actions={[]} 
        waitlistForm={<WaitlistForm />} 
        image={{
          src: "/lovable-uploads/ce6d7ca5-f300-40dd-95ff-fd2e261a3165.png",
          alt: "Neighborhood dashboard interface showing Quick Actions and activity feed"
        }} 
      />
      
      {/* Features section - Added below the hero section */}
      <Features />
      
      {/* You could add more sections here for testimonials, etc. */}
    </div>
  );
};

export default LandingPage;
