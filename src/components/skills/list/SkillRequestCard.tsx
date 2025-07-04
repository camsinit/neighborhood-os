
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { useUser } from '@supabase/auth-helpers-react';
import { SkillCategory, SkillWithProfile } from '../types/skillTypes';
import { useSkillUpdate } from '@/hooks/skills/useSkillUpdate';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, getInvalidationKeys } from '@/utils/queryKeys';
import ShareButton from '@/components/ui/share-button';

interface SkillRequestCardProps {
  skill: SkillWithProfile;
}

/**
 * SkillRequestCard - Displays a skill request in a card format matching SkillOfferCard
 * 
 * This component has been updated to show different actions based on ownership:
 * - For the skill owner: Shows edit and delete icons (on hover)
 * - For other users: Shows "Offer Help" button (on hover)
 * 
 * Updated to use centralized query key constants for consistent invalidation.
 */
const SkillRequestCard = ({ skill }: SkillRequestCardProps) => {
  // Get current user to check ownership
  const currentUser = useUser();
  
  // State for managing dialogs
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);
  // Add state to track hover for share button
  const [isHovering, setIsHovering] = useState(false);

  // Hook for skill operations (delete functionality) with success callback using centralized keys
  const queryClient = useQueryClient();
  const { deleteSkill, isLoading: isDeleting } = useSkillUpdate({
    onSuccess: () => {
      // Invalidate all skills-related queries using centralized constants
      const invalidationKeys = getInvalidationKeys('SKILLS');
      invalidationKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    }
  });

  // Check if current user owns this skill request
  const isOwner = currentUser?.id === skill.user_id;

  // Handle skill deletion
  const handleDeleteSkill = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSkill(skill.id, skill.title);
  };

  // Handle edit action (placeholder for now)
  const handleEditSkill = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement edit functionality
    console.log('Edit skill:', skill.title);
  };

  // Updated to use the new standardized 6 categories
  const categoryColors: Record<SkillCategory, {bg: string, text: string}> = {
    technology: {bg: 'bg-[#D3E4FD]', text: 'text-[#221F26]'},
    emergency: {bg: 'bg-[#FFDEE2]', text: 'text-[#D946EF]'},
    professional: {bg: 'bg-[#E5DEFF]', text: 'text-[#8B5CF6]'},
    maintenance: {bg: 'bg-[#FDE1D3]', text: 'text-[#F97316]'},
    care: {bg: 'bg-[#FFDEE2]', text: 'text-[#D946EF]'},
    education: {bg: 'bg-[#F2FCE2]', text: 'text-emerald-600'}
  };

  // Get the category colors from our map, fallback to technology if not found
  const categoryStyle = categoryColors[skill.skill_category as SkillCategory] || categoryColors.technology;

  return (
    <div 
      data-skill-id={skill.id}
      className="flex items-center p-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-white cursor-pointer relative group"
      onClick={() => !isOwner && setIsContributeDialogOpen(true)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* User profile and skill title */}
      <div className="flex items-center gap-3 flex-grow">
        <Avatar className="h-10 w-10">
          <AvatarImage src={skill.profiles?.avatar_url || undefined} />
          <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h4 className="font-medium text-gray-900">{skill.title}</h4>
        </div>
      </div>
      
      {/* Share button that shows on hover - positioned to avoid conflicts with owner actions */}
      {isHovering && !isOwner && (
        <div className="absolute right-20 top-1/2 transform -translate-y-1/2 z-10">
          <ShareButton
            contentType="skills"
            contentId={skill.id}
            neighborhoodId={skill.neighborhood_id}
            className="bg-white hover:bg-gray-50 border border-gray-200"
          />
        </div>
      )}
      
      {/* Category tag that hides on hover */}
      <Badge 
        className={`${categoryStyle.bg} ${categoryStyle.text} border-0 text-xs absolute right-2 top-1/2 transform -translate-y-1/2 group-hover:opacity-0 transition-opacity`}
      >
        {skill.skill_category.charAt(0).toUpperCase() + skill.skill_category.slice(1)}
      </Badge>
      
      {/* Conditional action buttons based on ownership - all hidden by default, shown on hover */}
      {isOwner ? (
        // Owner sees edit and delete icons that appear on hover
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEditSkill}
            className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white border-0"
            disabled={isDeleting}
          >
            <Edit size={14} />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteSkill}
            className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white border-0"
            disabled={isDeleting}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ) : (
        // Non-owners see the "Offer Help" button that appears on hover
        <Button 
          variant="outline" 
          onClick={(e) => {
            e.stopPropagation();
            setIsContributeDialogOpen(true);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white border-0"
        >
          Offer Help
        </Button>
      )}
    </div>
  );
};

export default SkillRequestCard;
