
/**
 * Hook for managing onboarding status checks
 * 
 * Handles checking if a user has completed onboarding and provides
 * loading states for the check process.
 */
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useOnboardingStatus = () => {
  // State for tracking onboarding completion check
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  
  const user = useUser();
  const location = useLocation();
  
  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Skip if we're already on the onboarding page to avoid loops
      if (location.pathname === '/onboarding') {
        setIsCheckingOnboarding(false);
        return;
      }
      
      // Skip if no user is present
      if (!user) {
        setIsCheckingOnboarding(false);
        return;
      }
      
      try {
        // Query the profiles table to check onboarding completion status
        const { data, error } = await supabase
          .from("profiles")
          .select("completed_onboarding")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        // Set flag to redirect if onboarding isn't completed
        setNeedsOnboarding(!data?.completed_onboarding);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Default to not needing onboarding on error to avoid redirect loops
        setNeedsOnboarding(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };
    
    if (user) {
      checkOnboardingStatus();
    } else {
      setIsCheckingOnboarding(false);
    }
  }, [user, location.pathname]);

  return {
    isCheckingOnboarding,
    needsOnboarding,
  };
};
