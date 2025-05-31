
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { SurveyFormData, FormSubmissionState } from "@/components/onboarding/survey/types/surveyTypes";
import { useAccountCreation } from "./form/useAccountCreation";
import { useProfileImageUpload } from "./form/useProfileImageUpload";
import { useSkillsManagement } from "./form/useSkillsManagement";
import { useProfileManagement } from "./form/useProfileManagement";

/**
 * Hook for handling unified onboarding form submission
 * 
 * Orchestrates the complete submission process including:
 * - Account creation (if user doesn't exist)
 * - Profile data updates/creation
 * - Profile image upload to Supabase storage
 * - Skills storage in skills_exchange table
 * - Setting completed_onboarding flag
 * - Error handling and retry logic
 * 
 * REFACTORED: Now uses smaller, focused hooks for each concern
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
   * Main submission function - now uses composed hooks for better organization
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

      // Step 2: Get user's neighborhood (20%)
      setSubmissionState(prev => ({ ...prev, progress: 20 }));
      const neighborhoodId = await getUserNeighborhoodId(userId);
      
      if (!neighborhoodId) {
        console.error("[useFormSubmission] No neighborhood found for user");
        throw new Error('Could not find user neighborhood. Please join a neighborhood first.');
      }

      console.log("[useFormSubmission] Found neighborhood:", neighborhoodId);

      // Step 3: Upload profile image if provided (50%)
      setSubmissionState(prev => ({ ...prev, progress: 50 }));
      let avatarUrl: string | null = null;
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
            formData.skillAvailability,
            formData.skillTimePreferences,
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

      toast({
        title: "Welcome to the neighborhood!",
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

      toast({
        title: "Setup Failed",
        description: errorMessage,
        variant: "destructive",
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
