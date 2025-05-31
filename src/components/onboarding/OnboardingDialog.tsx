
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useFormSubmission } from "@/hooks/useFormSubmission";
import { useGuestOnboarding } from "@/hooks/useGuestOnboarding";
import SurveyDialog from "./survey/SurveyDialog";

/**
 * OnboardingDialog component
 * 
 * A dialog that displays when a user needs to complete onboarding.
 * It wraps the survey dialog and handles the completion of onboarding.
 * Now includes form submission logic with proper data persistence.
 * 
 * UPDATED: Now handles both regular and guest onboarding flows
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
  
  // Check if we're in guest mode
  const isGuestMode = !!localStorage.getItem('guestOnboarding');
  
  // Get appropriate submission hook based on mode
  const { submitForm, submissionState: regularSubmissionState } = useFormSubmission();
  const { submitGuestOnboarding, submissionState: guestSubmissionState } = useGuestOnboarding();
  
  // Use the appropriate submission state
  const submissionState = isGuestMode ? guestSubmissionState : regularSubmissionState;
  
  /**
   * Handle joining neighborhood via pending invite code (for regular onboarding)
   */
  const handlePendingInviteJoin = async () => {
    const pendingInviteCode = localStorage.getItem('pendingInviteCode');
    
    if (!pendingInviteCode || !user?.id) {
      return;
    }

    try {
      // Get neighborhood info from invite code
      const { data: neighborhoodData, error: functionError } = await supabase
        .rpc('get_neighborhood_from_invite', { 
          invite_code_param: pendingInviteCode 
        });

      if (functionError || !neighborhoodData || neighborhoodData.length === 0) {
        console.error("Invalid or expired invite code");
        localStorage.removeItem('pendingInviteCode');
        return;
      }

      const result = neighborhoodData[0];
      
      // Check if invitation is still pending
      if (result.invitation_status !== 'pending') {
        localStorage.removeItem('pendingInviteCode');
        return;
      }

      // Add user as a neighborhood member
      const { error: memberError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: user.id,
          neighborhood_id: result.neighborhood_id,
          status: 'active'
        });

      if (memberError) {
        console.error("Error joining neighborhood:", memberError);
        return;
      }

      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('invite_code', pendingInviteCode);

      if (inviteError) {
        console.warn("Failed to update invitation status:", inviteError);
      }

      // Clean up stored invite code
      localStorage.removeItem('pendingInviteCode');
      
      // Show success message
      toast({
        title: "Welcome!",
        description: `You've successfully joined ${result.neighborhood_name}!`,
      });

    } catch (error: any) {
      console.error("Error processing pending invite:", error);
      localStorage.removeItem('pendingInviteCode');
    }
  };
  
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
      
      let success = false;
      
      if (isGuestMode) {
        // Guest onboarding flow - creates account and joins neighborhood
        success = await submitGuestOnboarding(formData);
      } else {
        // Regular onboarding flow - updates existing user profile
        success = await submitForm(formData);
      }
      
      if (success) {
        if (!isGuestMode) {
          // Handle pending invite code after successful regular onboarding
          await handlePendingInviteJoin();
        }
        
        // Close dialog and navigate to home
        onOpenChange(false);
        navigate("/home");
      }
      // Error handling is done in the submit functions
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
      isGuestMode={isGuestMode}
    />
  );
};

export default OnboardingDialog;
