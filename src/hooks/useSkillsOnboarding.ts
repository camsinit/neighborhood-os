import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

const logger = createLogger('useSkillsOnboarding');

/**
 * Hook for managing skills onboarding state
 * 
 * Checks if the current user has completed skills onboarding and provides
 * functions to manage the skills onboarding process on the Skills page.
 */
export const useSkillsOnboarding = () => {
  const [hasCompletedSkillsOnboarding, setHasCompletedSkillsOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const user = useUser();
  
  /**
   * Check if user has completed skills onboarding
   */
  useEffect(() => {
    const checkSkillsOnboardingStatus = async () => {
      if (!user) {
        setIsLoading(false);
        setHasCompletedSkillsOnboarding(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("completed_skills_onboarding")
          .eq("id", user.id)
          .single();
        
        if (error) {
          // If profile doesn't exist, user hasn't completed skills onboarding
          if (error.code === 'PGRST116') {
            setHasCompletedSkillsOnboarding(false);
          } else {
            throw error;
          }
        } else {
          setHasCompletedSkillsOnboarding(data?.completed_skills_onboarding || false);
        }
        
        logger.info("Skills onboarding status checked:", {
          userId: user.id,
          completed: data?.completed_skills_onboarding || false
        });
      } catch (err: any) {
        logger.error("Error checking skills onboarding status:", err);
        setError(err);
        setHasCompletedSkillsOnboarding(false); // Default to not completed on error
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSkillsOnboardingStatus();
  }, [user]);
  
  /**
   * Mark skills onboarding as completed
   */
  const completeSkillsOnboarding = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ completed_skills_onboarding: true })
        .eq("id", user.id);
      
      if (error) throw error;
      
      setHasCompletedSkillsOnboarding(true);
      logger.info("Skills onboarding marked as completed for user:", user.id);
      
      return true;
    } catch (err: any) {
      logger.error("Error completing skills onboarding:", err);
      setError(err);
      return false;
    }
  };
  
  /**
   * Reset skills onboarding status (for testing purposes)
   */
  const resetSkillsOnboarding = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ completed_skills_onboarding: false })
        .eq("id", user.id);
      
      if (error) throw error;
      
      setHasCompletedSkillsOnboarding(false);
      logger.info("Skills onboarding reset for user:", user.id);
      
      return true;
    } catch (err: any) {
      logger.error("Error resetting skills onboarding:", err);
      setError(err);
      return false;
    }
  };
  
  return {
    hasCompletedSkillsOnboarding,
    isLoading,
    error,
    completeSkillsOnboarding,
    resetSkillsOnboarding,
  };
};