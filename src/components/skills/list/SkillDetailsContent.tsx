
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { SkillWithProfile, SkillCategory } from '../types/skillTypes';
import { Calendar, MapPin, Clock, User } from 'lucide-react';
import ActionButtons from './ActionButtons';

/**
 * Props for the SkillDetailsContent component
 */
interface SkillDetailsContentProps {
  skill: SkillWithProfile;
  isOwner: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
  onRequestSkill?: () => void;
  showActions?: boolean; // New prop to control action visibility
}

/**
 * Component for displaying the details of a skill
 * This is shown in the details dialog
 */
const SkillDetailsContent: React.FC<SkillDetailsContentProps> = ({
  skill,
  isOwner,
  onDelete,
  isDeleting = false,
  onRequestSkill,
  showActions = true // Show actions by default in the details view
}) => {
  // Category color mapping
  const categoryColors: Record<SkillCategory, {bg: string, text: string}> = {
    creative: {bg: 'bg-[#FDE1D3]', text: 'text-[#F97316]'},
    trade: {bg: 'bg-[#E5DEFF]', text: 'text-[#8B5CF6]'},
    technology: {bg: 'bg-[#D3E4FD]', text: 'text-[#221F26]'},
    education: {bg: 'bg-[#F2FCE2]', text: 'text-emerald-600'},
    wellness: {bg: 'bg-[#FFDEE2]', text: 'text-[#D946EF]'},
  };
  
  // Get the category style
  const categoryStyle = categoryColors[skill.skill_category as SkillCategory] || categoryColors.technology;
  
  // Format the creation date
  const creationDate = new Date(skill.created_at);
  const formattedDate = format(creationDate, 'MMM d, yyyy');
  
  return (
    <div className="space-y-4">
      {/* User profile section */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={skill.profiles?.avatar_url || undefined} />
          <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="font-medium text-gray-900 flex items-center">
            {skill.profiles?.display_name || 'Anonymous'}
          </p>
          <p className="text-sm text-gray-500">
            Shared on {formattedDate}
          </p>
        </div>
      </div>
      
      {/* Category */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Category:</span>
        <Badge 
          className={`${categoryStyle.bg} ${categoryStyle.text} border-0`}
        >
          {skill.skill_category.charAt(0).toUpperCase() + skill.skill_category.slice(1)}
        </Badge>
      </div>
      
      {/* Description */}
      {skill.description && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-gray-500">Description:</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{skill.description}</p>
        </div>
      )}
      
      {/* Availability */}
      {skill.availability && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-gray-500">Availability:</h4>
          <p className="text-gray-700 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            {skill.availability}
          </p>
        </div>
      )}
      
      {/* Action buttons - only shown when showActions is true */}
      {showActions && (
        <ActionButtons 
          isOwner={isOwner}
          isRequest={skill.request_type === 'need'}
          onDelete={onDelete}
          onRequestSkill={onRequestSkill}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default SkillDetailsContent;
