
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';

/**
 * Hook to fetch all skills and group them by category for preview display
 * This provides the data needed for the category grid view
 * Now uses the current neighborhood context instead of manual lookup to support multi-neighborhood users
 */
export const useSkillsPreview = () => {
  const user = useUser();
  // Use the standardized neighborhood hook instead of manual fetching
  const neighborhood = useCurrentNeighborhood();

  return useQuery({
    // Include neighborhood_id in query key for proper cache isolation
    queryKey: ['skills-preview', user?.id, neighborhood?.id],
    queryFn: async () => {
      if (!user) {
        console.log('[useSkillsPreview] No user, returning empty object');
        return {};
      }

      // Check if we have a neighborhood selected - use the current neighborhood context
      if (!neighborhood?.id) {
        console.log('[useSkillsPreview] No neighborhood selected from context, returning empty object');
        return {};
      }

      console.log('[useSkillsPreview] Fetching skills for neighborhood:', {
        neighborhoodId: neighborhood.id,
        neighborhoodName: neighborhood.name,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      // Fetch all skills in the current neighborhood
      const { data: skills, error } = await supabase
        .from('skills_exchange')
        .select('id, title, skill_category, request_type')
        .eq('neighborhood_id', neighborhood.id) // Use neighborhood from context
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useSkillsPreview] Error fetching skills:', {
          error,
          neighborhoodId: neighborhood.id,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      // Group skills by category - now including all 6 standardized categories
      const groupedSkills: Record<SkillCategory, { offers: string[], requests: string[] }> = {
        technology: { offers: [], requests: [] },
        emergency: { offers: [], requests: [] },
        professional: { offers: [], requests: [] },
        maintenance: { offers: [], requests: [] },
        care: { offers: [], requests: [] },
        education: { offers: [], requests: [] }
      };

      skills?.forEach(skill => {
        const category = skill.skill_category as SkillCategory;
        if (groupedSkills[category]) {
          // Properly separate offers from requests
          if (skill.request_type === 'offer') {
            groupedSkills[category].offers.push(skill.title);
          } else if (skill.request_type === 'need') {
            groupedSkills[category].requests.push(skill.title);
          }
        }
      });

      console.log('[useSkillsPreview] Successfully grouped skills by category:', {
        neighborhoodId: neighborhood.id,
        neighborhoodName: neighborhood.name,
        categoryCounts: Object.entries(groupedSkills).map(([category, data]) => ({
          category,
          offers: data.offers.length,
          requests: data.requests.length
        })),
        timestamp: new Date().toISOString()
      });

      return groupedSkills;
    },
    // Only run the query if we have both user and neighborhood from context
    enabled: !!user && !!neighborhood?.id
  });
};
