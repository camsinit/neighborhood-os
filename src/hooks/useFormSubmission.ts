
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SurveyFormData, FormSubmissionState } from "@/components/onboarding/survey/types/surveyTypes";
import { SKILL_CATEGORIES } from "@/components/onboarding/survey/steps/skills/skillCategories";

/**
 * Hook for handling onboarding form submission
 * 
 * Manages the complete submission process including:
 * - Profile data updates
 * - Profile image upload to Supabase storage
 * - Skills storage in skills_exchange table
 * - Setting completed_onboarding flag
 * - Error handling and retry logic
 */
export const useFormSubmission = () => {
  const user = useUser();
  const { toast } = useToast();
  
  // Track submission state for UI feedback
  const [submissionState, setSubmissionState] = useState<FormSubmissionState>({
    isSubmitting: false,
    progress: 0,
    error: null,
    success: false,
  });

  /**
   * Upload profile image to Supabase storage
   */
  const uploadProfileImage = async (imageFile: File): Promise<string | null> => {
    if (!user?.id || !imageFile) return null;

    try {
      // Generate unique filename with user ID
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload to avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error('Failed to upload profile image');
    }
  };

  /**
   * Determine skill category for a given skill name
   */
  const getSkillCategory = (skillName: string): string => {
    for (const [categoryKey, categoryData] of Object.entries(SKILL_CATEGORIES)) {
      if (categoryData.skills.includes(skillName)) {
        return categoryKey;
      }
    }
    // Default category if not found
    return 'general';
  };

  /**
   * Parse skill name and details from formatted string
   */
  const parseSkill = (skillString: string): { name: string; details?: string } => {
    if (skillString.includes(': ')) {
      const [name, details] = skillString.split(': ');
      return { name: name.trim(), details: details.trim() };
    }
    return { name: skillString.trim() };
  };

  /**
   * Save skills to skills_exchange table
   */
  const saveSkills = async (
    skills: string[], 
    availability?: string, 
    timePreferences?: string[],
    neighborhoodId?: string
  ) => {
    if (!user?.id || skills.length === 0) return;

    try {
      // Parse and prepare skills data
      const skillsData = skills.map(skillString => {
        const { name, details } = parseSkill(skillString);
        const skillCategory = getSkillCategory(name);
        
        return {
          title: name,
          description: details || null,
          skill_category: skillCategory,
          request_type: 'offer',
          user_id: user.id,
          neighborhood_id: neighborhoodId,
          availability: availability || null,
          time_preferences: timePreferences || null,
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          is_archived: false,
        };
      });

      // Insert skills into database
      const { error } = await supabase
        .from('skills_exchange')
        .insert(skillsData);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving skills:', error);
      throw new Error('Failed to save skills');
    }
  };

  /**
   * Update user profile in profiles table
   */
  const updateProfile = async (formData: SurveyFormData, avatarUrl?: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const profileData = {
        id: user.id, // Include the required id field
        display_name: `${formData.firstName} ${formData.lastName}`.trim(),
        bio: formData.bio || null,
        phone_number: formData.phone || null,
        address: formData.address || null,
        avatar_url: avatarUrl || null,
        email_visible: formData.emailVisible,
        phone_visible: formData.phoneVisible,
        address_visible: formData.addressVisible,
        skills: formData.skills,
        completed_onboarding: true,
      };

      // Use upsert with proper conflict resolution
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  };

  /**
   * Get user's current neighborhood ID
   */
  const getUserNeighborhoodId = async (): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      // Check if user is a member of any neighborhood
      const { data: membership, error: membershipError } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membershipError && membership) {
        return membership.neighborhood_id;
      }

      // Check if user created a neighborhood
      const { data: neighborhood, error: neighborhoodError } = await supabase
        .from('neighborhoods')
        .select('id')
        .eq('created_by', user.id)
        .single();

      if (!neighborhoodError && neighborhood) {
        return neighborhood.id;
      }

      return null;
    } catch (error) {
      console.error('Error getting user neighborhood:', error);
      return null;
    }
  };

  /**
   * Main submission function
   */
  const submitForm = async (formData: SurveyFormData): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to complete onboarding.",
        variant: "destructive",
      });
      return false;
    }

    // Reset submission state
    setSubmissionState({
      isSubmitting: true,
      progress: 0,
      error: null,
      success: false,
    });

    try {
      // Step 1: Get user's neighborhood (10%)
      setSubmissionState(prev => ({ ...prev, progress: 10 }));
      const neighborhoodId = await getUserNeighborhoodId();

      // Step 2: Upload profile image if provided (30%)
      setSubmissionState(prev => ({ ...prev, progress: 30 }));
      let avatarUrl: string | null = null;
      if (formData.profileImage) {
        avatarUrl = await uploadProfileImage(formData.profileImage);
      }

      // Step 3: Update user profile (60%)
      setSubmissionState(prev => ({ ...prev, progress: 60 }));
      await updateProfile(formData, avatarUrl);

      // Step 4: Save skills if any are selected (90%)
      setSubmissionState(prev => ({ ...prev, progress: 90 }));
      if (formData.skills.length > 0) {
        await saveSkills(
          formData.skills,
          formData.skillAvailability,
          formData.skillTimePreferences,
          neighborhoodId
        );
      }

      // Step 5: Complete (100%)
      setSubmissionState({
        isSubmitting: false,
        progress: 100,
        error: null,
        success: true,
      });

      toast({
        title: "Welcome to the neighborhood!",
        description: "Your profile has been created successfully.",
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
