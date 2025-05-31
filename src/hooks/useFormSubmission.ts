
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SurveyFormData, FormSubmissionState } from "@/components/onboarding/survey/types/surveyTypes";
import { SKILL_CATEGORIES } from "@/components/onboarding/survey/steps/skills/skillCategories";

/**
 * Hook for handling unified onboarding form submission
 * 
 * Manages the complete submission process including:
 * - Account creation (if user doesn't exist)
 * - Profile data updates/creation
 * - Profile image upload to Supabase storage
 * - Skills storage in skills_exchange table
 * - Setting completed_onboarding flag
 * - Error handling and retry logic
 * 
 * UPDATED: Now handles account creation for new users in onboarding flow
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
   * Create user account if they don't have one
   */
  const createUserAccount = async (formData: SurveyFormData): Promise<string | null> => {
    if (!formData.email || !formData.password) {
      throw new Error('Email and password are required for account creation');
    }

    try {
      console.log("[useFormSubmission] Creating user account for:", formData.email);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: `${formData.firstName} ${formData.lastName}`.trim()
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account');

      console.log("[useFormSubmission] User account created successfully:", authData.user.id);
      return authData.user.id;
    } catch (error) {
      console.error('[useFormSubmission] Error creating user account:', error);
      throw new Error('Failed to create user account');
    }
  };

  /**
   * Upload profile image to Supabase storage
   */
  const uploadProfileImage = async (imageFile: File, userId: string): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      // Generate unique filename with user ID
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
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
    userId: string,
    availability?: string, 
    timePreferences?: string[],
    neighborhoodId?: string
  ) => {
    if (skills.length === 0) return;

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
          user_id: userId,
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
   * Create or update user profile in profiles table
   */
  const upsertProfile = async (formData: SurveyFormData, userId: string, avatarUrl?: string) => {
    try {
      const profileData = {
        id: userId,
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

      console.log("[useFormSubmission] Upserting profile for user:", userId);

      // Use upsert to handle both insert and update scenarios
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
      
      console.log("[useFormSubmission] Profile upserted successfully");
    } catch (error) {
      console.error('Error upserting profile:', error);
      throw new Error('Failed to create/update profile');
    }
  };

  /**
   * Get user's current neighborhood ID
   */
  const getUserNeighborhoodId = async (userId: string): Promise<string | null> => {
    try {
      // Check if user is a member of any neighborhood
      const { data: membership, error: membershipError } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!membershipError && membership) {
        return membership.neighborhood_id;
      }

      // Check if user created a neighborhood
      const { data: neighborhood, error: neighborhoodError } = await supabase
        .from('neighborhoods')
        .select('id')
        .eq('created_by', userId)
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
   * Main submission function - now handles both account creation and profile setup
   */
  const submitForm = async (formData: SurveyFormData): Promise<boolean> => {
    console.log("[useFormSubmission] Starting submission process");
    console.log("[useFormSubmission] Current user:", user ? `${user.id} (${user.email})` : 'null');
    console.log("[useFormSubmission] Form data email:", formData.email);

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
      if (formData.skills.length > 0) {
        await saveSkills(
          formData.skills,
          userId,
          formData.skillAvailability,
          formData.skillTimePreferences,
          neighborhoodId
        );
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
