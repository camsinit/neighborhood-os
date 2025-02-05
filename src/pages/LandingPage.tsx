import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, ArrowRight, Users, Calendar, Shield, HandHelping } from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1F0FB] via-[#D3E4FD] to-[#F2FCE2] flex flex-col">
      <nav className="max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Neighborhood<br />Dashboard
          </h1>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
              className="text-gray-700 hover:text-gray-900"
            >
              {isAuthenticated ? "View Dashboard" : "Log in"}
            </Button>
            <Button 
              variant="default" 
              onClick={() => navigate("/login")}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              Login/Sign up
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 flex-1">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 max-w-4xl leading-tight">
            Connect With Your Next-Door Neighbors Today
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl">
            Build meaningful relationships with the people who live closest to you. Create a stronger, more connected community right on your street.
          </p>
          <div className="flex gap-4">
            <Button 
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-6 text-lg"
            >
              Join Your Block
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        <BentoGrid className="px-4 mb-16">
          <BentoGridItem
            title="Block Events"
            description="Stay connected with what's happening right outside your door, from block parties to neighborhood meetings."
            className="md:col-span-1"
            icon={<Calendar className="h-6 w-6 text-blue-500" />}
          />
          <BentoGridItem
            title="Neighbor Support"
            description="Share resources and help with the people who live closest to you, creating a network of immediate support."
            className="md:col-span-1"
            icon={<HandHelping className="h-6 w-6 text-green-500" />}
          />
          <BentoGridItem
            title="Block Safety"
            description="Keep your immediate neighbors informed about local safety updates and concerns in real-time."
            className="md:col-span-1"
            icon={<Shield className="h-6 w-6 text-red-500" />}
          />
        </BentoGrid>
      </main>
    </div>
  );
};

export default LandingPage;