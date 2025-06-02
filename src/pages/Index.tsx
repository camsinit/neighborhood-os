
/**
 * Index page component
 * 
 * This component serves as the entry point to the application when a user visits the index route.
 * It redirects users based on authentication status, onboarding status, and neighborhood context.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useNeighborhood } from "@/contexts/neighborhood";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

/**
 * Index component that handles routing logic
 * 
 * This component determines where to send users based on their authentication,
 * onboarding status, and neighborhood status. It shows a loading indicator while making this determination.
 */
const Index = () => {
  // Navigation hook for redirecting users
  const navigate = useNavigate();
  
  // Get the current authenticated user
  const user = useUser();
  
  // State to track if we need to wait longer than expected
  const [isDelayed, setIsDelayed] = useState(false);
  
  // State to track onboarding status
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  
  // Get neighborhood context
  const { currentNeighborhood, isLoading: isLoadingNeighborhood, error, refreshNeighborhoodData } = useNeighborhood();
  
  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setIsCheckingOnboarding(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("completed_onboarding")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        setNeedsOnboarding(!data?.completed_onboarding);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Default to not needing onboarding on error
        setNeedsOnboarding(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };
    
    checkOnboardingStatus();
  }, [user]);
  
  // Set a timer to detect if loading is taking too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoadingNeighborhood || isCheckingOnboarding) {
        setIsDelayed(true);
      }
    }, 5000); // Show delayed message after 5 seconds
    
    return () => clearTimeout(timer);
  }, [isLoadingNeighborhood, isCheckingOnboarding]);
  
  // Effect to handle routing logic based on authentication, onboarding and neighborhood status
  useEffect(() => {
    // Safety check: If we're still loading data, wait
    if (isLoadingNeighborhood || isCheckingOnboarding) {
      console.log("[Index] Still loading data, waiting before routing...");
      return;
    }
    
    // Logging to help with debugging
    console.log("[Index] Routing decision point reached:", {
      isAuthenticated: !!user,
      needsOnboarding,
      hasNeighborhood: !!currentNeighborhood,
      neighborhoodId: currentNeighborhood?.id,
      userId: user?.id,
      neighborhoodError: error,
      timestamp: new Date().toISOString()
    });
    
    // Use immediate routing with replace to prevent history buildup
    // If user is not authenticated, redirect to landing page
    if (!user) {
      console.log("[Index] User not authenticated, redirecting to landing page");
      navigate("/", { replace: true });
      return;
    }
    
    // If user needs onboarding, redirect to onboarding page
    if (user && needsOnboarding) {
      console.log("[Index] User needs onboarding, redirecting to onboarding page");
      navigate("/onboarding", { replace: true });
      return;
    }
    
    // If authenticated and has neighborhood, redirect to home page
    if (user && currentNeighborhood) {
      console.log("[Index] User authenticated with neighborhood, redirecting to home page");
      navigate("/home", { replace: true });
      return;
    }
    
    // If there was an error loading neighborhood data or no neighborhood, redirect to home anyway
    // Let the home page handle the "no neighborhood" state instead of forcing join page
    if (user && (!currentNeighborhood || error)) {
      console.log("[Index] User authenticated but no neighborhood, redirecting to home page to handle gracefully");
      navigate("/home", { replace: true });
      return;
    }
  }, [user, currentNeighborhood, isLoadingNeighborhood, navigate, error, needsOnboarding, isCheckingOnboarding]);

  // Handle manual retry when there's an issue
  const handleRetry = async () => {
    await refreshNeighborhoodData();
    // If we have a user and neighborhood after refresh, go to home
    if (user && currentNeighborhood) {
      navigate("/home", { replace: true });
    }
  };

  // Show a visible loading indicator while determining where to route
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {isDelayed ? (
        <Card className="p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-center mb-4">Taking longer than expected...</h2>
          <p className="text-gray-600 mb-6 text-center">
            We're having trouble connecting to your neighborhood data. 
            You can wait a bit longer or try these options:
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry} className="w-full">
              Retry Connection
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/home")} 
              className="w-full"
            >
              Go to Home Anyway
            </Button>
          </div>
          {error && (
            <p className="text-amber-600 text-sm mt-4 text-center">
              Error details: {error.message || "Unknown connection issue"}
            </p>
          )}
        </Card>
      ) : (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Setting up your dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">
            {isLoadingNeighborhood ? "Loading your neighborhood..." : 
             isCheckingOnboarding ? "Checking profile status..." : 
             "Preparing your experience..."}
          </p>
          {error && (
            <p className="text-amber-600 text-sm mt-4">
              Note: Having trouble connecting to neighborhood data. 
              Taking you to home page where you can join a neighborhood.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
