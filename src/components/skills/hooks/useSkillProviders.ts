
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';

/**
 * Interface defining the structure of a skill provider
 * This helps us maintain type safety when working with provider data
 */
export interface SkillProvider {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email_visible: boolean;
  phone_visible: boolean;
  phone_number: string | null;
  email: string | null;
  preferredContactMethod: 'phone' | 'email' | 'app';
  contactValue: string | null;
}

/**
 * Custom hook to fetch skill providers for a specific skill
 * This hook handles all the complex logic for determining contact preferences
 * and fetching the actual contact information they want to share
 */
export const useSkillProviders = (skillTitle: string, skillCategory: string) => {
  const user = useUser();

  return useQuery({
    queryKey: ['skill-providers', skillTitle, skillCategory, user?.id],
    queryFn: async () => {
      // If no user is authenticated, return empty array
      if (!user) return [];

      // First, get the user's neighborhood to filter providers
      const { data: userNeighborhood } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!userNeighborhood) return [];

      // Fetch skill providers with their contact preferences and profile info
      const { data: skills, error } = await supabase
        .from('skills_exchange')
        .select(`
          user_id,
          profiles:user_id (
            display_name,
            avatar_url,
            email_visible,
            phone_visible,
            phone_number
          )
        `)
        .eq('neighborhood_id', userNeighborhood.neighborhood_id)
        .eq('skill_category', skillCategory)
        .eq('title', skillTitle)
        .eq('request_type', 'offer')
        .eq('is_archived', false)
        .neq('user_id', user.id); // Don't include current user

      if (error) throw error;

      // Process providers and determine preferred contact method
      const processedProviders: SkillProvider[] = [];
      
      for (const skill of skills || []) {
        const profile = skill.profiles;
        if (!profile) continue;

        let preferredContactMethod: 'phone' | 'email' | 'app' = 'app';
        let contactValue: string | null = null;
        let userEmail: string | null = null;

        // For email contacts, we need to fetch the actual email from auth.users
        if (profile.email_visible) {
          try {
            // Get the user's email from the auth.users table via a direct query
            const { data: authUser, error: emailError } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', skill.user_id)
              .single();

            if (!emailError && authUser) {
              // Use the admin client to get user email (this requires proper RLS policies)
              const { data: userData } = await supabase.auth.admin.getUserById(skill.user_id);
              if (userData?.user?.email) {
                userEmail = userData.user.email;
              }
            }
          } catch (error) {
            console.log('Could not fetch email for user:', skill.user_id);
          }
        }

        // Determine preferred contact method and set contact value
        // Priority: phone first (if visible and available), then email (if visible), then app
        if (profile.phone_visible && profile.phone_number) {
          preferredContactMethod = 'phone';
          contactValue = profile.phone_number;
        } 
        else if (profile.email_visible) {
          preferredContactMethod = 'email';
          // Use the actual email if we were able to fetch it, otherwise fall back to a message
          contactValue = userEmail || 'Email contact available';
        }

        processedProviders.push({
          user_id: skill.user_id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          email_visible: profile.email_visible,
          phone_visible: profile.phone_visible,
          phone_number: profile.phone_number,
          email: userEmail,
          preferredContactMethod,
          contactValue
        });
      }

      return processedProviders;
    },
    enabled: !!user,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
