
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import SurveyDialog from "./SurveyDialog";

/**
 * OnboardingDialog component
 * 
 * A dialog that displays when a user needs to complete onboarding.
 * It wraps the survey dialog and handles the completion of onboarding.
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
  
  // Handle completion of onboarding
  const handleOnboardingComplete = async () => {
    try {
      // Skip database update if in test mode
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
      
      // Normal operation - update database
      if (!user) return;
      
      // Mark onboarding as completed in the profiles table
      const { error } = await supabase
        .from("profiles")
        .update({ completed_onboarding: true })
        .eq("id", user.id);
        
      if (error) throw error;
      
      // Show success toast
      toast({
        title: "Profile setup complete!",
        description: "Your neighborhood profile is now set up.",
      });
      
      // Close dialog and navigate to home
      onOpenChange(false);
      navigate("/home");
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
      isTestMode={isTestMode} // Pass test mode status to survey dialog
    />
  );
};

export default OnboardingDialog;
