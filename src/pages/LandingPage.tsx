
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
        <Button asChild variant="outline" className={`rounded-full ${session ? 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 p-[2px]' : 'border-primary hover:bg-primary/10'}`}>
          {session ? (
            <div className="bg-background rounded-full px-4 py-2">
              <Link to="/dashboard" className="transition-colors text-muted-foreground">
                Dashboard
              </Link>
            </div>
          ) : (
            <Link to="/login" className="transition-colors text-foreground">
              Login
            </Link>
          )}
        </Button>
      </header>
      
      {/* Hero section with waitlist form and app preview */}
      <div className="mt-[50px]">
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
      </div>
      
      {/* Features section with accordion - Added directly below hero */}
      <Features />
      
      {/* Footer with credits */}
      <footer className="py-8 text-center text-muted-foreground">
        <p>Made with ❤️ in Oakland by <a href="https://x.com/camsinit" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cam</a></p>
      </footer>
    </div>
  );
};

export default LandingPage;
