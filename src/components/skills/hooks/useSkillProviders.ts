
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
  email: string | null; // Will be null since we can't easily access auth.users.email
  preferredContactMethod: 'phone' | 'email' | 'app';
  contactValue: string | null;
}

/**
 * Custom hook to fetch skill providers for a specific skill
 * This hook handles all the complex logic for determining contact preferences
 * and fetching the actual contact information (phone) they want to share
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

        // Determine preferred contact method and set contact value
        // Priority: phone first (if visible and available), then email (if visible), then app
        if (profile.phone_visible && profile.phone_number) {
          preferredContactMethod = 'phone';
          contactValue = profile.phone_number;
        } 
        else if (profile.email_visible) {
          preferredContactMethod = 'email';
          // For email, we can't easily access the actual email from auth.users
          // So we'll indicate email is the preferred method but show a message
          contactValue = 'Contact via email (email address will be shared)';
        }

        processedProviders.push({
          user_id: skill.user_id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          email_visible: profile.email_visible,
          phone_visible: profile.phone_visible,
          phone_number: profile.phone_number,
          email: null, // We can't easily get this from auth.users
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
