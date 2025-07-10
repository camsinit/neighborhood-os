
import { supabase } from "@/integrations/supabase/client";
import { SurveyFormData } from "@/components/onboarding/survey/types/surveyTypes";

/**
 * Hook for managing user profile data
 */
export const useProfileManagement = () => {
  /**
   * Create or update user profile in profiles table
   */
  const upsertProfile = async (formData: SurveyFormData, userId: string, avatarUrl?: string) => {
    try {
      const profileData = {
        id: userId,
        display_name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone_number: formData.phone || null,
        address: formData.address || null,
        avatar_url: avatarUrl || null,
        email_visible: formData.emailVisible,
        phone_visible: formData.phoneVisible,
        address_visible: false,
        // skills removed - no longer collected during onboarding
        completed_onboarding: true,
      };

      console.log("[useProfileManagement] Upserting profile for user:", userId);

      // Use upsert to handle both insert and update scenarios
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
      
      console.log("[useProfileManagement] Profile upserted successfully");
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

  return { upsertProfile, getUserNeighborhoodId };
};
