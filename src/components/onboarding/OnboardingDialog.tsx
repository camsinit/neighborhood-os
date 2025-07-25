
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useFormSubmission } from "@/hooks/useFormSubmission";
import { usePendingInviteHandler } from "./hooks/usePendingInviteHandler";
import { useActivityPreload } from "@/hooks/useActivityPreload";
import SurveyDialog from "./survey/SurveyDialog";
import { extractOAuthUserData, isOAuthUser } from "@/utils/oauthDataExtraction";

/**
 * OnboardingDialog component
 * 
 * A dialog that displays when a user needs to complete onboarding.
 * It wraps the survey dialog and handles the completion of onboarding.
 * Now uses a unified onboarding flow that assumes new users without accounts.
 * 
 * UPDATED FLOW: 
 * 1. User completes survey steps (including profile picture selection)
 * 2. Form submission happens and profile is created
 * 3. Welcome screen displays with confetti animation
 * 4. User clicks "Get Started" button to proceed to dashboard
 * 5. Navigation to /home happens after welcome screen interaction
 * 
 * This ensures users see the welcome message and confetti before being
 * rushed to the dashboard, creating a better onboarding experience.
 * 
 * PREVIOUS BEHAVIOR: 
 * - No longer handles invite processing - now done in useFormSubmission
 * - Pre-loads neighborhood activity during onboarding for better UX
 */
interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OnboardingDialog = ({ 
  open, 
  onOpenChange
}: OnboardingDialogProps) => {
  const navigate = useNavigate();
  
  const user = useUser();
  
  console.log("[OnboardingDialog] Component initialized");
  console.log("[OnboardingDialog] User:", user ? `${user.id} (${user.email})` : 'null');
  
  // Use the unified submission hook
  // Note: We no longer need to handle pending invites here as it's now done in useFormSubmission
  const { submitForm, submissionState } = useFormSubmission();
  const { clearPendingInvite } = usePendingInviteHandler();
  
  // Pre-load activity feed when dialog is open to ensure smooth experience after onboarding
  const { isPreloaded } = useActivityPreload(open);
  
  // Handle completion of onboarding - now expects formData parameter
  const handleOnboardingComplete = async (formData: any) => {
    console.log("[OnboardingDialog] handleOnboardingComplete called");
    console.log("[OnboardingDialog] Form data:", formData);
    
    try {
      console.log("[OnboardingDialog] Starting unified onboarding submission");
      // Unified onboarding flow - creates account and sets up profile
      const success = await submitForm(formData);
      console.log("[OnboardingDialog] Unified onboarding result:", success);
      
      if (success) {
        console.log("[OnboardingDialog] Onboarding completed successfully");
        console.log("[OnboardingDialog] Activity feed pre-loaded:", isPreloaded ? "Yes" : "No");
        
        // Clear the pending invite from localStorage since it's been processed
        clearPendingInvite();
        
        // Set a flag in localStorage to show the welcome popover on the home page
        localStorage.setItem('showWelcomePopover', 'true');
        
        // Close the onboarding dialog
        onOpenChange(false);
        
        // Navigate directly to home page where the welcome popover will appear
        navigate("/home");
      }
      // Error handling is done in the submit function
    } catch (error: any) {
      console.error("[OnboardingDialog] Error completing onboarding:", error);
      
      // Show error toast
      showErrorToast(
        "Error",
        "Failed to complete profile setup. Please try again."
      );
    }
  };
  
  return (
    <SurveyDialog 
      open={open} 
      onOpenChange={onOpenChange} 
      onComplete={handleOnboardingComplete} 
      submissionState={submissionState}
    />
  );
};

export default OnboardingDialog;
