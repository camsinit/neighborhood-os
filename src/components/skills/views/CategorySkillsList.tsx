
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, Edit, Trash } from 'lucide-react';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import SkillContactPopover from '@/components/skills/SkillContactPopover';

/**
 * CategorySkillsList - Simple list format for skills in a category
 * 
 * This component displays skills as a simple list with skill names on the left
 * and profile images (or stacks for multiple offers) on the right.
 * Shows edit/delete buttons for user's own skills, request button for others.
 */
interface CategorySkillsListProps {
  selectedCategory: SkillCategory;
}

const CategorySkillsList: React.FC<CategorySkillsListProps> = ({
  selectedCategory
}) => {
  const user = useUser();

  // Fetch skills grouped by title to stack profiles for the same skill
  const {
    data: skillsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['category-skills-list', selectedCategory, user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user's neighborhood
      const {
        data: userNeighborhood
      } = await supabase.from('neighborhood_members').select('neighborhood_id').eq('user_id', user.id).eq('status', 'active').single();
      if (!userNeighborhood) return [];

      // Fetch skills with user profiles
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

      // Group skills by title to create stacks
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

  // Handle edit skill
  const handleEditSkill = (skillId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit skill:', skillId);
  };

  // Handle delete skill
  const handleDeleteSkill = async (skillId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete skill:', skillId);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading skills...</span>
      </div>;
  }
  if (error) {
    return <div className="text-center py-8 text-gray-500">
        <p>Error loading skills. Please try again.</p>
      </div>;
  }
  if (!skillsData || skillsData.length === 0) {
    return <div className="text-center py-8 text-gray-500">
        <p>No skills found in this category</p>
      </div>;
  }

  return <div className="space-y-2">
      {skillsData.map((skillGroup, index) => <div key={index} className="group relative flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-all duration-200">
          {/* Skill title on the left */}
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{skillGroup.title}</h3>
            {skillGroup.profiles.length > 1 && <p className="text-sm text-gray-500 mt-1">
                {skillGroup.profiles.length} neighbors offering
              </p>}
          </div>
          
          {/* Action buttons that appear on hover - positioned between title and profiles */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-4">
            {skillGroup.userOwnsSkill ? (
              // Show edit/delete buttons for user's own skills
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEditSkill(skillGroup.userSkillId)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteSkill(skillGroup.userSkillId)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // Show request button for others' skills
              <SkillContactPopover
                skillTitle={skillGroup.title}
                skillCategory={selectedCategory}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50 flex items-center gap-1.5"
                >
                  <MessageSquare className="h-4 w-4" />
                  Request
                </Button>
              </SkillContactPopover>
            )}
          </div>
          
          {/* Profile images on the right */}
          <div className="flex items-center">
            {skillGroup.profiles.length === 1 ?
        // Single profile
        <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={skillGroup.profiles[0].avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {skillGroup.profiles[0].display_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
              </div> :
        // Multiple profiles - show stacked avatars
        <div className="flex items-center">
                <div className="flex -space-x-2">
                  {skillGroup.profiles.slice(0, 3).map((profile, profileIndex) => <Avatar key={profileIndex} className="h-8 w-8 border-2 border-white" style={{
              zIndex: skillGroup.profiles.length - profileIndex
            }}>
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {profile.display_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>)}
                  {skillGroup.profiles.length > 3 && <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                      +{skillGroup.profiles.length - 3}
                    </div>}
                </div>
              </div>}
          </div>
        </div>)}
    </div>;
};

export default CategorySkillsList;
