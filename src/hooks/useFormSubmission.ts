
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { SurveyFormData, FormSubmissionState } from "@/components/onboarding/survey/types/surveyTypes";
import { useAccountCreation } from "./form/useAccountCreation";
import { useProfileImageUpload } from "./form/useProfileImageUpload";
import { useSkillsManagement } from "./form/useSkillsManagement";
import { useProfileManagement } from "./form/useProfileManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";

/**
 * Hook for handling unified onboarding form submission
 * 
 * Orchestrates the complete submission process including:
 * - Account creation (if user doesn't exist)
 * - Processing any pending neighborhood invitation
 * - Profile data updates/creation
 * - Profile image upload to Supabase storage
 * - Skills storage in skills_exchange table
 * - Setting completed_onboarding flag
 * - Error handling and retry logic
 * 
 * UPDATED: Now processes pending invites BEFORE checking neighborhood or creating profile
 */
export const useFormSubmission = () => {
  const user = useUser();
  const { toast } = useToast();
  
  // Import the individual hooks for each concern
  const { createUserAccount } = useAccountCreation();
  const { uploadProfileImage } = useProfileImageUpload();
  const { saveSkills } = useSkillsManagement();
  const { upsertProfile, getUserNeighborhoodId } = useProfileManagement();
  
  // Track submission state for UI feedback
  const [submissionState, setSubmissionState] = useState<FormSubmissionState>({
    isSubmitting: false,
    progress: 0,
    error: null,
    success: false,
  });

  /**
   * Process a pending invite code from localStorage and add the user to the neighborhood
   * 
   * @param userId The ID of the user to add to the neighborhood
   * @returns The neighborhood ID if successful, null if no pending invite or error
   */
  const processPendingInvite = async (userId: string): Promise<string | null> => {
    try {
      // Check if there's a pending invite code in localStorage
      const pendingInviteCode = localStorage.getItem('pendingInviteCode');
      
      if (!pendingInviteCode) {
        console.log("[useFormSubmission] No pending invite code found in localStorage");
        return null;
      }
      
      console.log("[useFormSubmission] Found pending invite code:", pendingInviteCode);
      
      // Get the neighborhood information from the invite code
      const { data: inviteData, error: inviteError } = await supabase
        .rpc('get_neighborhood_from_invite', { 
          invite_code_param: pendingInviteCode 
        });

      if (inviteError || !inviteData || inviteData.length === 0) {
        console.error("[useFormSubmission] Invalid or expired invite code:", inviteError || "No data returned");
        toast({
          title: "Invalid Invite",
          description: "The invite link you used is invalid or has expired.",
          variant: "destructive",
        });
        return null;
      }

      const neighborhoodId = inviteData[0].neighborhood_id;
      console.log("[useFormSubmission] Found neighborhood from invite:", neighborhoodId);
      
      // Add the user as a member of the neighborhood
      const { error: memberError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: userId,
          neighborhood_id: neighborhoodId,
          status: 'active'
        });

      if (memberError) {
        console.error("[useFormSubmission] Error adding user to neighborhood:", memberError);
        toast({
          title: "Couldn't Join Neighborhood",
          description: "There was an issue joining the neighborhood. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      // Mark the invitation as accepted
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by_id: userId,
          accepted_at: new Date().toISOString()
        })
        .eq('invite_code', pendingInviteCode);

      if (updateError) {
        console.warn("[useFormSubmission] Error updating invitation status:", updateError);
        // Don't fail for this error since the user is already added to the neighborhood
      }

      // Clear the pending invite from localStorage since it's been processed
      localStorage.removeItem('pendingInviteCode');
      
      console.log("[useFormSubmission] Successfully processed invite and joined neighborhood:", neighborhoodId);
      return neighborhoodId;
    } catch (error) {
      console.error("[useFormSubmission] Error processing pending invite:", error);
      return null;
    }
  };

  /**
   * Main submission function - now processes pending invites first
   */
  const submitForm = async (formData: SurveyFormData): Promise<boolean> => {
    console.log("[useFormSubmission] Starting submission process");
    console.log("[useFormSubmission] Current user:", user ? `${user.id} (${user.email})` : 'null');
    console.log("[useFormSubmission] Form data email:", formData.email);
    console.log("[useFormSubmission] Skills to save:", formData.skills);

    // Reset submission state
    setSubmissionState({
      isSubmitting: true,
      progress: 0,
      error: null,
      success: false,
    });

    try {
      let userId: string;

      // Step 1: Ensure we have a user account (10%)
      setSubmissionState(prev => ({ ...prev, progress: 10 }));
      
      if (!user?.id) {
        console.log("[useFormSubmission] No existing user, creating account");
        // Create new user account
        const newUserId = await createUserAccount(formData);
        if (!newUserId) {
          throw new Error('Failed to create user account');
        }
        userId = newUserId;
      } else {
        console.log("[useFormSubmission] Using existing user:", user.id);
        userId = user.id;
      }

      // Step 2: Process any pending invite and join neighborhood (20%)
      setSubmissionState(prev => ({ ...prev, progress: 20 }));
      let neighborhoodId = await processPendingInvite(userId);
      
      // If no pending invite was processed, check if the user is already in a neighborhood
      if (!neighborhoodId) {
        console.log("[useFormSubmission] No invite processed, checking for existing neighborhood");
        neighborhoodId = await getUserNeighborhoodId(userId);
      }
      
      if (!neighborhoodId) {
        console.error("[useFormSubmission] No neighborhood found for user");
        throw new Error('Could not find user neighborhood. Please join a neighborhood first.');
      }

      console.log("[useFormSubmission] Found neighborhood:", neighborhoodId);

      // Step 3: Upload profile image if provided (50%)
      setSubmissionState(prev => ({ ...prev, progress: 50 }));
      let avatarUrl: string | undefined;
      if (formData.profileImage) {
        avatarUrl = await uploadProfileImage(formData.profileImage, userId);
      }

      // Step 4: Create/update user profile (70%)
      setSubmissionState(prev => ({ ...prev, progress: 70 }));
      await upsertProfile(formData, userId, avatarUrl);

      // Step 5: Save skills if any are selected (90%)
      setSubmissionState(prev => ({ ...prev, progress: 90 }));
      if (formData.skills && formData.skills.length > 0) {
        console.log("[useFormSubmission] Saving skills:", formData.skills);
        try {
          await saveSkills(
            formData.skills,
            userId,
            neighborhoodId
          );
          console.log("[useFormSubmission] Skills saved successfully");
        } catch (skillError) {
          console.error("[useFormSubmission] Error saving skills:", skillError);
          // Don't fail the entire submission for skills errors
          // but log it and show a warning
          toast({
            title: "Profile Created",
            description: "Your profile was created but there was an issue saving your skills. You can add them later in the Skills section.",
            variant: "default",
          });
        }
      } else {
        console.log("[useFormSubmission] No skills to save");
      }

      // Step 6: Complete (100%)
      setSubmissionState({
        isSubmitting: false,
        progress: 100,
        error: null,
        success: true,
      });

      sonnerToast.success("Welcome to the neighborhood!", {
        description: "Your account and profile have been created successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('Form submission error:', error);
      
      const errorMessage = error.message || 'An unexpected error occurred while setting up your profile.';
      
      setSubmissionState({
        isSubmitting: false,
        progress: 0,
        error: errorMessage,
        success: false,
      });

      sonnerToast.error("Setup Failed", {
        description: errorMessage,
      });

      return false;
    }
  };

  /**
   * Reset submission state
   */
  const resetSubmission = () => {
    setSubmissionState({
      isSubmitting: false,
      progress: 0,
      error: null,
      success: false,
    });
  };

  return {
    submitForm,
    submissionState,
    resetSubmission,
  };
};
