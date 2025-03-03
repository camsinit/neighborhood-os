
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { HeroSection } from "@/components/ui/hero-section";
import WaitlistForm from "@/components/waitlist/WaitlistForm";

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
      {/* Hero section with waitlist form and app preview */}
      <HeroSection
        title="Connect and care for your neighborhood"
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
