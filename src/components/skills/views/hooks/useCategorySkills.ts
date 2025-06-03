
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * Hook to fetch and group skills by category
 * 
 * This hook fetches all skills in a category from the user's neighborhood
 * and groups them by title to create stacks of profiles offering the same skill.
 */
export const useCategorySkills = (selectedCategory: SkillCategory) => {
  const user = useUser();

  return useQuery({
    queryKey: ['category-skills-list', selectedCategory, user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user's neighborhood - find the active membership
      const {
        data: userNeighborhood
      } = await supabase.from('neighborhood_members').select('neighborhood_id').eq('user_id', user.id).eq('status', 'active').single();
      if (!userNeighborhood) return [];

      // Fetch skills with user profiles from the same neighborhood
      const {
        data: skills,
        error
      } = await supabase.from('skills_exchange').select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `).eq('neighborhood_id', userNeighborhood.neighborhood_id).eq('skill_category', selectedCategory).eq('request_type', 'offer').eq('is_archived', false).order('title');
      if (error) throw error;

      // Group skills by title to create stacks of people offering the same skill
      const grouped = skills?.reduce((acc, skill) => {
        const title = skill.title.toLowerCase();
        if (!acc[title]) {
          acc[title] = {
            title: skill.title,
            profiles: [],
            skillIds: [],
            userOwnsSkill: false
          };
        }
        acc[title].profiles.push({
          display_name: skill.profiles?.display_name || 'Anonymous',
          avatar_url: skill.profiles?.avatar_url,
          user_id: skill.user_id
        });
        acc[title].skillIds.push(skill.id);
        
        // Check if current user owns any skill in this group
        if (skill.user_id === user.id) {
          acc[title].userOwnsSkill = true;
          acc[title].userSkillId = skill.id; // Store the user's skill ID for edit/delete
        }
        
        return acc;
      }, {} as Record<string, any>);
      return Object.values(grouped || {});
    },
    enabled: !!user && !!selectedCategory
  });
};
