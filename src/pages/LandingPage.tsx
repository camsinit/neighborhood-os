import { HeroSection } from "@/components/ui/hero-section";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";

/**
 * LandingPage - The main entry point for new visitors
 * 
 * This page serves as the public-facing homepage, showcasing the 
 * Neighborhood OS dashboard and providing a path to login.
 */
const LandingPage = () => {
  // Get navigation and session context
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();
  
  // Check if user is authenticated and redirect to dashboard if they are
  useEffect(() => {
    // Only perform the redirect check after auth state is loaded
    if (!isLoading) {
      console.log("[LandingPage] Checking authentication state:", { 
        hasSession: !!session, 
        isLoading 
      });
      
      // Redirect to dashboard if user is authenticated
      if (session) {
        console.log("[LandingPage] User is authenticated, redirecting to dashboard");
        navigate("/dashboard");
      }
    }
  }, [session, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar with login button */}
      <nav className="py-4 px-6 flex justify-between items-center">
        <div className="text-2xl font-bold">Neighborhood OS</div>
        <Button asChild variant="outline">
          <Link to="/login" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Log In
          </Link>
        </Button>
      </nav>

      {/* Hero section with main messaging */}
      <HeroSection
        badge={{
          text: "Community-driven platform",
          action: {
            text: "Learn how it works",
            href: "/login",
          },
        }}
        title="Connect and strengthen your neighborhood"
        description="Neighborhood OS helps communities share resources, coordinate events, and build resilience through simple digital tools designed for real-world connections."
        actions={[
          {
            text: "Get Started",
            href: "/login",
            variant: "default",
          },
          {
            text: "Learn More",
            href: "/login",
            variant: "outline",
          },
        ]}
        image={{
          src: "/placeholder.svg", // Using the placeholder image that's available in the project
          alt: "Neighborhood OS Dashboard Preview",
        }}
      />

      {/* Feature section highlighting key benefits */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">Bring your community together</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background border rounded-lg p-6">
              <h3 className="text-xl font-medium mb-2">Resource Sharing</h3>
              <p className="text-muted-foreground">Exchange goods, tools, and skills with neighbors to build a more sustainable community.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-background border rounded-lg p-6">
              <h3 className="text-xl font-medium mb-2">Community Calendar</h3>
              <p className="text-muted-foreground">Coordinate events, gatherings, and volunteer opportunities in one central place.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-background border rounded-lg p-6">
              <h3 className="text-xl font-medium mb-2">Safety Updates</h3>
              <p className="text-muted-foreground">Stay informed about important neighborhood news and safety information.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action footer */}
      <section className="py-16 px-6 bg-muted/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to strengthen your neighborhood?</h2>
          <p className="text-muted-foreground mb-8">Join Neighborhood OS today and discover the power of connected communities.</p>
          <Button asChild size="lg">
            <Link to="/login">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
