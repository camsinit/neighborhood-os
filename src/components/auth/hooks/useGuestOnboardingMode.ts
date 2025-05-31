
/**
 * Hook for detecting pending invite onboarding mode
 * 
 * Checks localStorage to determine if we're in onboarding flow via invite.
 * UPDATED: Simplified to check for pending invite codes only
 */
import { useMemo } from "react";

export const useGuestOnboardingMode = () => {
  // Check if we're in onboarding mode by looking for pending invite
  const isGuestOnboardingMode = useMemo(() => {
    return !!localStorage.getItem('pendingInviteCode');
  }, []);
  
  return { isGuestOnboardingMode };
};
