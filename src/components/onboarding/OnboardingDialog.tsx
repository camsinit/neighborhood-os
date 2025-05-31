
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useFormSubmission } from "@/hooks/useFormSubmission";
import SurveyDialog from "./survey/SurveyDialog";

/**
 * OnboardingDialog component
 * 
 * A dialog that displays when a user needs to complete onboarding.
 * It wraps the survey dialog and handles the completion of onboarding.
 * Now uses a unified onboarding flow that assumes new users without accounts.
 * 
 * UPDATED: Simplified to single onboarding flow - no guest mode logic
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
  
  console.log("[OnboardingDialog] Component initialized");
  console.log("[OnboardingDialog] Test mode:", isTestMode);
  console.log("[OnboardingDialog] User:", user ? `${user.id} (${user.email})` : 'null');
  
  // Use the unified submission hook
  const { submitForm, submissionState } = useFormSubmission();
  
  /**
   * Handle joining neighborhood via pending invite code
   */
  const handlePendingInviteJoin = async (userId: string) => {
    const pendingInviteCode = localStorage.getItem('pendingInviteCode');
    
    console.log("[OnboardingDialog] handlePendingInviteJoin called");
    console.log("[OnboardingDialog] Pending invite code:", pendingInviteCode);
    console.log("[OnboardingDialog] User ID:", userId);
    
    if (!pendingInviteCode || !userId) {
      console.log("[OnboardingDialog] No pending invite code or user, skipping join");
      return;
    }

    try {
      console.log("[OnboardingDialog] Getting neighborhood from invite code");
      
      // Get neighborhood info from invite code
      const { data: neighborhoodData, error: functionError } = await supabase
        .rpc('get_neighborhood_from_invite', { 
          invite_code_param: pendingInviteCode 
        });

      if (functionError || !neighborhoodData || neighborhoodData.length === 0) {
        console.error("[OnboardingDialog] Invalid or expired invite code", functionError);
        localStorage.removeItem('pendingInviteCode');
        return;
      }

      const result = neighborhoodData[0];
      console.log("[OnboardingDialog] Neighborhood data:", result);
      
      // Check if invitation is still pending
      if (result.invitation_status !== 'pending') {
        console.log("[OnboardingDialog] Invitation no longer pending:", result.invitation_status);
        localStorage.removeItem('pendingInviteCode');
        return;
      }

      console.log("[OnboardingDialog] Adding user to neighborhood");
      
      // Add user as a neighborhood member
      const { error: memberError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: userId,
          neighborhood_id: result.neighborhood_id,
          status: 'active'
        });

      if (memberError) {
        console.error("[OnboardingDialog] Error joining neighborhood:", memberError);
        return;
      }

      console.log("[OnboardingDialog] Marking invitation as accepted");
      
      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by_id: userId,
          accepted_at: new Date().toISOString()
        })
        .eq('invite_code', pendingInviteCode);

      if (inviteError) {
        console.warn("[OnboardingDialog] Failed to update invitation status:", inviteError);
      }

      // Clean up stored invite code
      localStorage.removeItem('pendingInviteCode');
      console.log("[OnboardingDialog] Successfully joined neighborhood via invite");
      
      // Show success message
      toast({
        title: "Welcome!",
        description: `You've successfully joined ${result.neighborhood_name}!`,
      });

    } catch (error: any) {
      console.error("[OnboardingDialog] Error processing pending invite:", error);
      localStorage.removeItem('pendingInviteCode');
    }
  };
  
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
  
  // Log dialog state changes
  useEffect(() => {
    console.log("[OnboardingDialog] Dialog open state changed:", open);
  }, [open]);
  
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
