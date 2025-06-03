
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * Hook to fetch all skills and group them by category for preview display
 * This provides the data needed for the category grid view
 */
export const useSkillsPreview = () => {
  const user = useUser();

  return useQuery({
    queryKey: ['skills-preview', user?.id],
    queryFn: async () => {
      if (!user) return {};

      // Get user's neighborhood
      const { data: userNeighborhood } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!userNeighborhood) return {};

      // Fetch all skills in the neighborhood
      const { data: skills, error } = await supabase
        .from('skills_exchange')
        .select('id, title, skill_category, request_type')
        .eq('neighborhood_id', userNeighborhood.neighborhood_id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group skills by category
      const groupedSkills: Record<SkillCategory, { offers: string[], requests: string[] }> = {
        technology: { offers: [], requests: [] },
        creative: { offers: [], requests: [] },
        trade: { offers: [], requests: [] },
        education: { offers: [], requests: [] },
        wellness: { offers: [], requests: [] }
      };

      skills?.forEach(skill => {
        const category = skill.skill_category as SkillCategory;
        if (groupedSkills[category]) {
          if (skill.request_type === 'offer') {
            groupedSkills[category].offers.push(skill.title);
          } else {
            groupedSkills[category].requests.push(skill.title);
          }
        }
      });

      return groupedSkills;
    },
    enabled: !!user
  });
};
