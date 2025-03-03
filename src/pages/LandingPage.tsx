
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link import
import { useSessionContext } from "@supabase/auth-helpers-react";
import { HeroSection } from "@/components/ui/hero-section";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import { Button } from "@/components/ui/button"; // Added Button import

/**
 * LandingPage component
 * 
 * The public-facing landing page with a waitlist signup form
 * and hero image showcasing the application.
 */
const LandingPage = () => {
  // Initialize the navigate function from React Router to handle redirections
  const navigate = useNavigate();
  
  // Get the user's session from Supabase Auth context
  const { session } = useSessionContext();
  
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
          <img 
            src="/lovable-uploads/efc842e4-4adc-4085-8062-5465882c2788.png" 
            alt="Neighborhood OS Logo" 
            className="h-24" // Changed from h-36 to h-24 (reduced to 2/3: 36px × 2/3 = 24px)
          />
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
        title="Your neighborhood dashboard"
        description="Share skills, exchange goods, and build resilient communities together."
        // No actions array - removing the "Join Waitlist" button below the description
        actions={[]}
        waitlistForm={<WaitlistForm />}
        image={{
          src: "/lovable-uploads/f04070b4-dab4-46df-8af0-0d0960eb1119.png",
          alt: "Skills exchange platform preview",
        }}
      />
      
      {/* You could add more sections here for features, testimonials, etc. */}
    </div>
  );
};

export default LandingPage;
