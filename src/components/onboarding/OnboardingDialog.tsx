
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useFormSubmission } from "@/hooks/useFormSubmission";
import SurveyDialog from "./SurveyDialog";

/**
 * OnboardingDialog component
 * 
 * A dialog that displays when a user needs to complete onboarding.
 * It wraps the survey dialog and handles the completion of onboarding.
 * Now includes form submission logic with proper data persistence.
 * 
 * When used in test mode, it bypasses the database update.
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
  
  // Get form submission hook
  const { submitForm, submissionState } = useFormSubmission();
  
  // Handle completion of onboarding - now expects formData parameter
  const handleOnboardingComplete = async (formData: any) => {
    try {
      // Skip form submission if in test mode
      if (isTestMode) {
        // Show test mode completion toast
        toast({
          title: "Test Mode",
          description: "Onboarding test completed. Your profile was not modified.",
        });
        
        // Close dialog but don't navigate in test mode
        onOpenChange(false);
        return;
      }
      
      // Normal operation - submit form data
      const success = await submitForm(formData);
      
      if (success) {
        // Close dialog and navigate to home
        onOpenChange(false);
        navigate("/home");
      }
      // Error handling is done in the submitForm function
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      
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
