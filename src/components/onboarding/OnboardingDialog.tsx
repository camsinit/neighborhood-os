
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useFormSubmission } from "@/hooks/useFormSubmission";
import { usePendingInviteHandler } from "./hooks/usePendingInviteHandler";
import SurveyDialog from "./survey/SurveyDialog";

/**
 * OnboardingDialog component
 * 
 * A dialog that displays when a user needs to complete onboarding.
 * It wraps the survey dialog and handles the completion of onboarding.
 * Now uses a unified onboarding flow that assumes new users without accounts.
 * 
 * REFACTORED: Simplified by extracting invite handling logic to a separate hook
 */
interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isTestMode?: boolean; // New prop to indicate if we're in test mode
}

const OnboardingDialog = ({ 
  open, 
  onOpenChange, 
  isTestMode = false 
}: OnboardingDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useUser();
  
  console.log("[OnboardingDialog] Component initialized");
  console.log("[OnboardingDialog] Test mode:", isTestMode);
  console.log("[OnboardingDialog] User:", user ? `${user.id} (${user.email})` : 'null');
  
  // Use the unified submission hook and invite handler
  const { submitForm, submissionState } = useFormSubmission();
  const { handlePendingInviteJoin } = usePendingInviteHandler();
  
  // Handle completion of onboarding - now expects formData parameter
  const handleOnboardingComplete = async (formData: any) => {
    console.log("[OnboardingDialog] handleOnboardingComplete called");
    console.log("[OnboardingDialog] Form data:", formData);
    console.log("[OnboardingDialog] Test mode:", isTestMode);
    
    try {
      // Skip form submission if in test mode
      if (isTestMode) {
        console.log("[OnboardingDialog] Test mode - showing completion toast");
        
        // Show test mode completion toast
        toast({
          title: "Test Mode",
          description: "Onboarding test completed. Your profile was not modified.",
        });
        
        // Close dialog but don't navigate in test mode
        onOpenChange(false);
        return;
      }
      
      console.log("[OnboardingDialog] Starting unified onboarding submission");
      // Unified onboarding flow - creates account and sets up profile
      const success = await submitForm(formData);
      console.log("[OnboardingDialog] Unified onboarding result:", success);
      
      if (success) {
        // Get the current user after successful submission
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser) {
          console.log("[OnboardingDialog] Handling pending invite join for new user");
          // Handle pending invite code after successful onboarding
          await handlePendingInviteJoin(currentUser.id);
        }
        
        console.log("[OnboardingDialog] Onboarding completed successfully, navigating to home");
        
        // Close dialog and navigate to home
        onOpenChange(false);
        navigate("/home");
      }
      // Error handling is done in the submit function
    } catch (error: any) {
      console.error("[OnboardingDialog] Error completing onboarding:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to complete profile setup. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <SurveyDialog 
      open={open} 
      onOpenChange={onOpenChange} 
      onComplete={handleOnboardingComplete} 
      isTestMode={isTestMode}
      submissionState={submissionState}
    />
  );
};

export default OnboardingDialog;
