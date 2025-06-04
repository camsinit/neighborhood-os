
import { useState, useEffect } from "react";

/**
 * Hook to detect and handle pending invitations during onboarding
 * 
 * UPDATED: Now just checks for pending invite code but doesn't process it
 * The actual processing happens during form submission in useFormSubmission.ts
 */
export const usePendingInviteHandler = () => {
  const [hasPendingInvite, setHasPendingInvite] = useState(false);
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);

  // Check for pending invite code in localStorage
  useEffect(() => {
    const savedInviteCode = localStorage.getItem('pendingInviteCode');
    
    if (savedInviteCode) {
      console.log("[usePendingInviteHandler] Found pending invite code:", savedInviteCode);
      setHasPendingInvite(true);
      setPendingInviteCode(savedInviteCode);
    } else {
      console.log("[usePendingInviteHandler] No pending invite code found");
      setHasPendingInvite(false);
      setPendingInviteCode(null);
    }
  }, []);

  // Clear invite code from state and localStorage
  const clearPendingInvite = () => {
    console.log("[usePendingInviteHandler] Clearing pending invite code");
    localStorage.removeItem('pendingInviteCode');
    setHasPendingInvite(false);
    setPendingInviteCode(null);
  };

  return {
    hasPendingInvite,
    pendingInviteCode,
    clearPendingInvite
  };
};
