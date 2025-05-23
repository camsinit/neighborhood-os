
/**
 * useOnboarding hook
 * 
 * This hook provides functionality to check and manage a user's onboarding status.
 * It allows components to:
 * 1. Check if the current user has completed onboarding
 * 2. Mark onboarding as complete
 * 3. Redirect users based on their onboarding status
 */
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useOnboarding = () => {
  // Track onboarding status
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get user, toast and navigation functions
  const user = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if the user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("completed_onboarding")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        
        setIsOnboardingCompleted(data?.completed_onboarding || false);
      } catch (err: any) {
        console.error("Error checking onboarding status:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkOnboardingStatus();
  }, [user]);
  
  // Mark onboarding as complete
  const completeOnboarding = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ completed_onboarding: true })
        .eq("id", user.id);
      
      if (error) throw error;
      
      setIsOnboardingCompleted(true);
      toast({
        title: "Onboarding Complete",
        description: "Your profile has been set up successfully!",
      });
      
      return true;
    } catch (err: any) {
      console.error("Error completing onboarding:", err);
      toast({
        title: "Error",
        description: "Unable to complete onboarding. Please try again.",
        variant: "destructive",
      });
      setError(err);
      return false;
    }
  };
  
  // Redirect based on onboarding status
  const redirectBasedOnOnboardingStatus = () => {
    if (isLoading || isOnboardingCompleted === null) return;
    
    if (user && !isOnboardingCompleted) {
      navigate("/onboarding");
    } else if (!user) {
      navigate("/login");
    }
  };
  
  return {
    isOnboardingCompleted,
    isLoading,
    error,
    completeOnboarding,
    redirectBasedOnOnboardingStatus,
  };
};

export default useOnboarding;
