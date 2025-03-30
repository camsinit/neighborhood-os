
/**
 * Enhanced component for displaying skill activities in the feed
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Book } from "lucide-react";
import { Activity } from "@/utils/queries/useActivities";
import { Button } from "@/components/ui/button";

/**
 * Props for SkillActivityContent
 */
interface SkillActivityContentProps {
  activity: Activity;
  onClick: () => void;
}

/**
 * Component for displaying rich skill activity content in the activity feed
 * Shows additional context like skill category and provides action buttons
 * 
 * @param activity - The activity data to display
 * @param onClick - Function to call when action button is clicked
 */
const SkillActivityContent: React.FC<SkillActivityContentProps> = ({ 
  activity,
  onClick
}) => {
  // Determine if this is a skill offering or request
  const isOffering = activity.activity_type === 'skill_offered';
  
  // Set the color for the skill icon
  const color = '#9b87f5'; // Skills purple color
  
  // Extract category from metadata if available
  const category = activity.metadata?.skill_category || 
    activity.metadata?.category || 
    'Skill';
  
  return (
    <div className="flex flex-col gap-1">
      {/* Title section with optional category badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Book className="h-4 w-4" style={{ color }} aria-hidden="true" />
          <span className="font-medium">{activity.title}</span>
        </div>
        
        {/* Display category as a badge if available */}
        {category && (
          <Badge 
            variant="outline" 
            className="bg-purple-50 text-purple-800 border-none text-xs"
          >
            {category}
          </Badge>
        )}
      </div>
      
      {/* Action button - customized based on skill type */}
      <div className="mt-1">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs border-purple-200 hover:bg-purple-50"
          onClick={onClick}
          aria-label={isOffering ? 'Learn more about this skill' : 'Help with this skill request'}
        >
          {isOffering ? 'Learn More' : 'Help Out'}
        </Button>
      </div>
    </div>
  );
};

export default SkillActivityContent;
