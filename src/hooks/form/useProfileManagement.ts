
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
      // Calculate years lived here from the move-in year
      const calculateYearsLived = (yearMovedIn: number | null): number | null => {
        if (yearMovedIn === null) return null;
        const currentYear = new Date().getFullYear();
        return Math.max(0, currentYear - yearMovedIn);
      };

      const profileData = {
        id: userId,
        display_name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone_number: formData.phone || null,
        address: formData.address || null,
        avatar_url: avatarUrl || null,
        email_visible: formData.emailVisible,
        phone_visible: formData.phoneVisible,
        address_visible: false,
        years_lived_here: calculateYearsLived(formData.yearMovedIn),
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

      // Trigger onboarding email series if user came from an invite
      try {
        const pendingInviteCode = localStorage.getItem('pendingInviteCode');
        if (pendingInviteCode) {
          console.log("[useProfileManagement] User completed onboarding from invite, triggering email series");
          
          // Get user's neighborhood info for the email series
          const neighborhoodId = await getUserNeighborhoodId(userId);
          if (neighborhoodId) {
            const { data: neighborhoodData } = await supabase
              .from('neighborhoods')
              .select('name')
              .eq('id', neighborhoodId)
              .single();

            const { data: authUser } = await supabase.auth.getUser();
            
            if (neighborhoodData && authUser.user?.email) {
              await supabase.functions.invoke('queue-onboarding-series', {
                body: {
                  userEmail: authUser.user.email,
                  firstName: formData.firstName,
                  neighborhoodName: neighborhoodData.name,
                  userId: userId,
                  neighborhoodId: neighborhoodId
                }
              });
              console.log("[useProfileManagement] Onboarding email series queued successfully");
            }
          }
        }
      } catch (emailError) {
        console.warn("[useProfileManagement] Failed to queue onboarding series:", emailError);
        // Don't fail profile creation for email errors
      }
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
