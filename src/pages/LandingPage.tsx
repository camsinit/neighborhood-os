
import { useSessionContext } from "@supabase/auth-helpers-react";
import { HeroSection } from "@/components/ui/hero-section";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
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
        
        {/* Conditional shimmer button - Dashboard for authenticated users, Login for unauthenticated */}
        {session ? (
          <Link to="/dashboard" /* This stays as /dashboard as it's the entry point that handles routing */>
            <ShimmerButton 
              shimmerColor="#ffffff"
              shimmerDuration="2s"
              background="linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))"
              className="rounded-full border border-primary/20 px-6 py-2 text-white shadow-lg"
            >
              Dashboard
            </ShimmerButton>
          </Link>
        ) : (
          <Link to="/login">
            <ShimmerButton 
              shimmerColor="#ffffff"
              shimmerDuration="2s"
              background="linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))"
              className="rounded-full border border-primary/20 px-6 py-2 text-white shadow-lg"
            >
              Login
            </ShimmerButton>
          </Link>
        )}
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
