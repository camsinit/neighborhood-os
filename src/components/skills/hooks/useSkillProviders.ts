
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';

/**
 * Interface defining the structure of a skill provider
 * This helps us maintain type safety when working with provider data
 * Updated to match the actual database structure returned from the query
 */
export interface SkillProvider {
  user_id: string;
  skill_description?: string | null;
  time_preferences?: string[] | null;
  user_profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    email_visible: boolean;
    phone_visible: boolean;
    phone_number: string | null;
    email?: string | null; // This comes from the secure function
  } | null;
  preferredContactMethod: 'phone' | 'email' | 'app';
  contactValue: string | null;
}

/**
 * Custom hook to fetch skill providers for a specific skill
 * This hook handles all the complex logic for determining contact preferences
 * and fetching the actual contact information they want to share
 * 
 * Updated to include ALL providers including the current user for transparency
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

      // Fetch ALL skill providers including the current user for transparency
      const { data: skills, error } = await supabase
        .from('skills_exchange')
        .select(`
          user_id,
          description,
          time_preferences,
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
        .eq('is_archived', false);
        // REMOVED: .neq('user_id', user.id) - now includes current user

      if (error) throw error;

      // Fetch visible email addresses using our secure function
      const { data: emailsData, error: emailsError } = await supabase
        .rpc('get_neighborhood_user_emails', {
          target_neighborhood_id: userNeighborhood.neighborhood_id
        });

      if (emailsError) {
        console.error('Error fetching emails for skill providers:', emailsError);
        // Continue without emails rather than failing
      }

      // Create a map of user_id to email for easy lookup
      const emailMap = new Map<string, string>();
      if (emailsData) {
        emailsData.forEach((emailEntry: any) => {
          emailMap.set(emailEntry.user_id, emailEntry.email);
        });
      }

      // Process providers and determine preferred contact method
      const processedProviders: SkillProvider[] = [];
      
      for (const skill of skills || []) {
        const profile = skill.profiles;
        if (!profile) continue;

        let preferredContactMethod: 'phone' | 'email' | 'app' = 'app';
        let contactValue: string | null = null;
        
        // Get the actual email if the user has email_visible = true
        const actualEmail = emailMap.get(skill.user_id);

        // Determine preferred contact method and set contact value
        // Priority: phone first (if visible and available), then email (if visible), then app
        if (profile.phone_visible && profile.phone_number) {
          preferredContactMethod = 'phone';
          contactValue = profile.phone_number;
        } 
        else if (profile.email_visible && actualEmail) {
          preferredContactMethod = 'email';
          contactValue = actualEmail;
        }

        // Create the user_profiles object with the email included
        const userProfiles = {
          ...profile,
          email: actualEmail
        };

        processedProviders.push({
          user_id: skill.user_id,
          skill_description: skill.description,
          time_preferences: skill.time_preferences,
          user_profiles: userProfiles,
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
