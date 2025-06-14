import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { HeroSection } from "@/components/ui/hero-section";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import { Button } from "@/components/ui/button";
import Features from "@/components/landing/Features"; // Import the new Features component

/**
 * LandingPage component
 * 
 * The public-facing landing page with a waitlist signup form,
 * hero image showcasing the application, and features section.
 * Now includes an integrated survey flow after waitlist signup.
 */
const LandingPage = () => {
  // Initialize the navigate function from React Router to handle redirections
  const navigate = useNavigate();

  // Get the user's session from Supabase Auth context
  const {
    session
  } = useSessionContext();

  // If user is already logged in, redirect to dashboard
  // This effect runs when the component mounts and whenever session changes
  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);
  
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation header with logo and login button */}
      <header className="w-full py-4 px-6 flex justify-between items-center">
        {/* Logo in the top left */}
        <div className="flex items-center">
          
        </div>
        
        {/* Login button in the top right - updated to have rounded-full class for oval shape */}
        <Button asChild className="rounded-full">
          <Link to="/login" className="hover:bg-primary/90 transition-colors">
            Login
          </Link>
        </Button>
      </header>
      
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
      
      {/* Features section - Added below the hero section */}
      <Features />
      
      {/* You could add more sections here for testimonials, etc. */}
    </div>
  );
};

export default LandingPage;
