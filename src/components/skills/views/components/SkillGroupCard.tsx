
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Trash, MessageSquare } from 'lucide-react';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import SkillContactPopover from '@/components/skills/SkillContactPopover';

/**
 * SkillGroupCard - Displays a single skill group with profiles and actions
 * 
 * This component shows a skill title, list of neighbors offering it,
 * and appropriate action buttons (edit/delete for own skills, request for others).
 */
interface SkillGroupCardProps {
  skillGroup: {
    title: string;
    profiles: Array<{
      display_name: string;
      avatar_url?: string;
      user_id: string;
    }>;
    userOwnsSkill: boolean;
    userSkillId?: string;
  };
  selectedCategory: SkillCategory;
  isUpdating: boolean;
  onEdit: (skillId: string, title: string) => void;
  onDelete: (skillId: string, title: string) => void;
}

const SkillGroupCard: React.FC<SkillGroupCardProps> = ({
  skillGroup,
  selectedCategory,
  isUpdating,
  onEdit,
  onDelete
}) => {
  return (
    <div className="group relative flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-all duration-200">
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
              onClick={() => onEdit(skillGroup.userSkillId!, skillGroup.title)}
              disabled={isUpdating}
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => onDelete(skillGroup.userSkillId!, skillGroup.title)}
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
  );
};

export default SkillGroupCard;
