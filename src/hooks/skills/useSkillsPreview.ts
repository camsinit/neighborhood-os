
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * Hook to fetch all skills and group them by category for preview display
 * This provides the data needed for the category grid view
 * Now uses the current neighborhood context instead of manually fetching user neighborhood
 * This fixes issues where users in multiple neighborhoods couldn't see skills properly
 */
export const useSkillsPreview = () => {
  const user = useUser();
  // Use the current neighborhood context instead of manual lookup
  const currentNeighborhood = useCurrentNeighborhood();

  return useQuery({
    queryKey: ['skills-preview', user?.id, currentNeighborhood?.id],
    queryFn: async () => {
      if (!user || !currentNeighborhood?.id) {
        console.log('useSkillsPreview: Missing user or neighborhood', {
          hasUser: !!user,
          hasNeighborhood: !!currentNeighborhood,
          neighborhoodId: currentNeighborhood?.id
        });
        return {};
      }

      // Add debug logging for the problematic user
      if (user.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
        console.log('[DEBUG - User 74bf...] useSkillsPreview fetching skills for neighborhood:', {
          neighborhoodId: currentNeighborhood.id,
          neighborhoodName: currentNeighborhood.name
        });
      }

      // Fetch all skills in the current neighborhood
      const { data: skills, error } = await supabase
        .from('skills_exchange')
        .select('id, title, skill_category, request_type')
        .eq('neighborhood_id', currentNeighborhood.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching skills preview:', error);
        throw error;
      }

      // Add debug logging for the problematic user
      if (user.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
        console.log('[DEBUG - User 74bf...] useSkillsPreview fetched skills:', {
          skillsCount: skills?.length || 0,
          skills: skills?.map(s => ({ title: s.title, category: s.skill_category, type: s.request_type }))
        });
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
          // Properly separate offers from requests - use 'need' for requests
          if (skill.request_type === 'offer') {
            groupedSkills[category].offers.push(skill.title);
          } else if (skill.request_type === 'need') { // Fixed: Use 'need' for requests
            groupedSkills[category].requests.push(skill.title);
          }
        }
      });

      // Add debug logging for the problematic user
      if (user.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
        console.log('[DEBUG - User 74bf...] useSkillsPreview grouped skills:', groupedSkills);
      }

      return groupedSkills;
    },
    enabled: !!user && !!currentNeighborhood?.id
  });
};
