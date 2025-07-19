
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useFormSubmission } from "@/hooks/useFormSubmission";
import { usePendingInviteHandler } from "./hooks/usePendingInviteHandler";
import SurveyDialog from "./survey/SurveyDialog";
import { extractOAuthUserData, isOAuthUser } from "@/utils/oauthDataExtraction";

/**
 * OnboardingDialog component
 * 
 * A dialog that displays when a user needs to complete onboarding.
 * It wraps the survey dialog and handles the completion of onboarding.
 * Now uses a unified onboarding flow that assumes new users without accounts.
 * 
 * UPDATED: No longer handles invite processing - now done in useFormSubmission
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
        console.log("[OnboardingDialog] Onboarding completed successfully, navigating to home");
        
        // We don't need to handle invitation processing here anymore since
        // it's now handled in the useFormSubmission hook
        
        // Clear the pending invite from localStorage since it's been processed
        clearPendingInvite();
        
        // Close dialog and navigate to home
        onOpenChange(false);
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
