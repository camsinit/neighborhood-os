
/**
 * Hook for detecting guest onboarding mode
 * 
 * Checks localStorage to determine if we're in guest onboarding flow.
 */
import { useMemo } from "react";

export const useGuestOnboardingMode = () => {
  // Check if we're in guest onboarding mode by looking for stored data
  const isGuestOnboardingMode = useMemo(() => {
    return !!localStorage.getItem('guestOnboarding');
  }, []);
  
  return { isGuestOnboardingMode };
};
