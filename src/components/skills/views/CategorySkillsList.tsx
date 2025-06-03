
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, Edit, Trash } from 'lucide-react';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import SkillContactPopover from '@/components/skills/SkillContactPopover';
import { useSkillUpdate } from '@/hooks/skills/useSkillUpdate';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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
  const { updateSkillTitle, deleteSkill, isLoading: isUpdating } = useSkillUpdate();
  
  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<{ id: string; title: string } | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Fetch skills grouped by title to stack profiles for the same skill
  const {
    data: skillsData,
    isLoading,
    error,
    refetch
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

  /**
   * Handle edit skill - opens edit dialog
   */
  const handleEditSkill = (skillId: string, currentTitle: string) => {
    setEditingSkill({ id: skillId, title: currentTitle });
    setEditTitle(currentTitle);
    setEditDialogOpen(true);
  };

  /**
   * Handle save edit - updates skill title in database
   */
  const handleSaveEdit = async () => {
    if (!editingSkill || !editTitle.trim()) {
      toast.error('Please enter a valid skill title');
      return;
    }

    const success = await updateSkillTitle(editingSkill.id, editTitle.trim());
    if (success) {
      setEditDialogOpen(false);
      setEditingSkill(null);
      setEditTitle('');
      // Refetch the skills data to update the UI
      refetch();
    }
  };

  /**
   * Handle delete skill - deletes skill from database with confirmation
   */
  const handleDeleteSkill = async (skillId: string, skillTitle: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${skillTitle}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    const success = await deleteSkill(skillId, skillTitle);
    if (success) {
      // Refetch the skills data to update the UI
      refetch();
    }
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

  return (
    <>
      <div className="space-y-2">
        {skillsData.map((skillGroup, index) => (
          <div key={index} className="group relative flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-all duration-200">
            {/* Skill title on the left */}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{skillGroup.title}</h3>
              {skillGroup.profiles.length > 1 && (
                <p className="text-sm text-gray-500 mt-1">
                  {skillGroup.profiles.length} neighbors offering
                </p>
              )}
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
                    onClick={() => handleEditSkill(skillGroup.userSkillId, skillGroup.title)}
                    disabled={isUpdating}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteSkill(skillGroup.userSkillId, skillGroup.title)}
                    disabled={isUpdating}
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
              {skillGroup.profiles.length === 1 ? (
                // Single profile
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={skillGroup.profiles[0].avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {skillGroup.profiles[0].display_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                // Multiple profiles - show stacked avatars
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {skillGroup.profiles.slice(0, 3).map((profile, profileIndex) => (
                      <Avatar 
                        key={profileIndex} 
                        className="h-8 w-8 border-2 border-white" 
                        style={{ zIndex: skillGroup.profiles.length - profileIndex }}
                      >
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {profile.display_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {skillGroup.profiles.length > 3 && (
                      <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                        +{skillGroup.profiles.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Skill Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="skill-title">Skill Title</Label>
              <Input
                id="skill-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter skill title..."
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingSkill(null);
                setEditTitle('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editTitle.trim() || isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategorySkillsList;
