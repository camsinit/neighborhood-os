
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
  const navigate = useNavigate();
  const { session } = useSessionContext();
  
  // If user is already logged in, redirect to dashboard
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
        badge={{
          text: "Early Access",
          action: {
            text: "Sign up now",
            href: "#waitlist",
          },
        }}
        waitlistForm={<WaitlistForm />}
        image={{
          src: "/lovable-uploads/93ce5a6d-0cd1-4119-926e-185060c6479d.png", // User's uploaded image
          alt: "Neighborhood app preview",
        }}
      />
      
      {/* You could add more sections here for features, testimonials, etc. */}
    </div>
  );
};

export default LandingPage;
