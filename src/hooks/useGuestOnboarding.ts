
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SurveyFormData, FormSubmissionState } from "@/components/onboarding/survey/types/surveyTypes";
import { SKILL_CATEGORIES } from "@/components/onboarding/survey/steps/skills/skillCategories";

/**
 * Hook for handling guest onboarding flow
 * 
 * This handles the complete process of:
 * 1. Creating a new user account
 * 2. Setting up their profile
 * 3. Joining the neighborhood from the invite
 * 4. Uploading profile image and skills
 */
export const useGuestOnboarding = () => {
  const navigate = useNavigate();
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
   * Create user profile in profiles table
   */
  const createProfile = async (formData: SurveyFormData, userId: string, avatarUrl?: string) => {
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

      // Insert profile data
      const { error } = await supabase
        .from('profiles')
        .insert(profileData);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create profile');
    }
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
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
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
   * Determine skill category for a given skill name
   */
  const getSkillCategory = (skillName: string): string => {
    for (const [categoryKey, categoryData] of Object.entries(SKILL_CATEGORIES)) {
      if (categoryData.skills.includes(skillName)) {
        return categoryKey;
      }
    }
    return 'general';
  };

  /**
   * Join neighborhood using stored invite data
   */
  const joinNeighborhood = async (userId: string) => {
    const guestData = localStorage.getItem('guestOnboarding');
    if (!guestData) return;

    try {
      const { inviteCode, neighborhood } = JSON.parse(guestData);

      // Add user as a neighborhood member
      const { error: memberError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: userId,
          neighborhood_id: neighborhood.id,
          status: 'active'
        });

      if (memberError) throw memberError;

      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by_id: userId,
          accepted_at: new Date().toISOString()
        })
        .eq('invite_code', inviteCode);

      if (inviteError) {
        console.warn("Failed to update invitation status:", inviteError);
      }

      // Clean up stored data
      localStorage.removeItem('guestOnboarding');

      return neighborhood.name;
    } catch (error) {
      console.error('Error joining neighborhood:', error);
      throw new Error('Failed to join neighborhood');
    }
  };

  /**
   * Main guest onboarding submission function
   */
  const submitGuestOnboarding = async (formData: SurveyFormData): Promise<boolean> => {
    // Check if we have guest onboarding data
    const guestData = localStorage.getItem('guestOnboarding');
    if (!guestData) {
      toast({
        title: "Error",
        description: "Missing neighborhood invitation data.",
        variant: "destructive",
      });
      return false;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "Error", 
        description: "Please fill in all required fields.",
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
      // Step 1: Create user account (20%)
      setSubmissionState(prev => ({ ...prev, progress: 20 }));
      
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

      const userId = authData.user.id;

      // Step 2: Upload profile image if provided (40%)
      setSubmissionState(prev => ({ ...prev, progress: 40 }));
      let avatarUrl: string | null = null;
      if (formData.profileImage) {
        avatarUrl = await uploadProfileImage(formData.profileImage, userId);
      }

      // Step 3: Create user profile (60%)
      setSubmissionState(prev => ({ ...prev, progress: 60 }));
      await createProfile(formData, userId, avatarUrl);

      // Step 4: Join neighborhood (80%)
      setSubmissionState(prev => ({ ...prev, progress: 80 }));
      const neighborhoodName = await joinNeighborhood(userId);

      // Step 5: Save skills if any are selected (90%)
      setSubmissionState(prev => ({ ...prev, progress: 90 }));
      if (formData.skills.length > 0) {
        const { neighborhood } = JSON.parse(guestData);
        await saveSkills(
          formData.skills,
          userId,
          formData.skillAvailability,
          formData.skillTimePreferences,
          neighborhood.id
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
        title: `Welcome to ${neighborhoodName}!`,
        description: "Your account has been created and you've joined the neighborhood.",
      });

      return true;
    } catch (error: any) {
      console.error('Guest onboarding error:', error);
      
      const errorMessage = error.message || 'An unexpected error occurred during setup.';
      
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
    submitGuestOnboarding,
    submissionState,
    resetSubmission,
  };
};
