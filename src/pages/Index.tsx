
/**
 * Dashboard Entry Point Component
 * 
 * This component serves as the entry point for authenticated users.
 * It determines where to route users based on their onboarding status and neighborhood context.
 * This replaces the previous Index that had infinite redirect loops.
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
 * Dashboard entry component for authenticated users only
 * 
 * This component determines where to send authenticated users based on their 
 * onboarding status and neighborhood status. It shows a loading indicator while making this determination.
 */
const Index = () => {
  // Navigation hook for redirecting users
  const navigate = useNavigate();
  
  // Get the current authenticated user (should always exist due to ProtectedRoute)
  const user = useUser();
  
  
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
  
  // Effect to handle routing logic based on onboarding and neighborhood status
  useEffect(() => {
    // Safety check: If we're still loading data, wait
    if (isLoadingNeighborhood || isCheckingOnboarding || !user) {
      console.log("[Dashboard] Still loading data, waiting before routing...");
      return;
    }
    
    // Logging to help with debugging
    console.log("[Dashboard] Routing decision point reached:", {
      needsOnboarding,
      hasNeighborhood: !!currentNeighborhood,
      neighborhoodId: currentNeighborhood?.id,
      userId: user?.id,
      neighborhoodError: error,
      timestamp: new Date().toISOString()
    });
    
    // If user needs onboarding, redirect to onboarding page
    if (needsOnboarding) {
      console.log("[Dashboard] User needs onboarding, redirecting to onboarding page");
      navigate("/onboarding", { replace: true });
      return;
    }
    
    // If authenticated and has neighborhood, redirect to neighborhood-aware home page
    if (currentNeighborhood) {
      console.log("[Dashboard] User authenticated with neighborhood, redirecting to neighborhood-aware home page");
      navigate(`/n/${currentNeighborhood.id}/home`, { replace: true });
      return;
    }
    
    // If there was an error loading neighborhood data or no neighborhood, redirect to legacy home
    // Let the home page handle the "no neighborhood" state instead of forcing join page
    if (!currentNeighborhood || error) {
      console.log("[Dashboard] User authenticated but no neighborhood, redirecting to legacy home page to handle gracefully");
      navigate("/home", { replace: true });
      return;
    }
  }, [user, currentNeighborhood, isLoadingNeighborhood, navigate, error, needsOnboarding, isCheckingOnboarding]);


  // Show a visible loading indicator while determining where to route
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-gray-600">Loading your neighborhood...</p>
      </div>
    </div>
  );
};

export default Index;
