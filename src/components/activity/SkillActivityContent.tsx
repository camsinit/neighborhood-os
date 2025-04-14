
/**
 * Enhanced component for displaying skill activities in the feed
 * Now simplified for inline display
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
 * Component for displaying skill activity content in the activity feed
 * Now simplified for a single line layout
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
    <div className="flex items-center justify-between w-full">
      {/* Title with icon */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Book className="h-4 w-4 flex-shrink-0" style={{ color }} aria-hidden="true" />
        <span className="font-medium text-sm truncate">{activity.title}</span>
      </div>
      
      {/* Compact layout with category badge and action button side by side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {category && (
          <Badge 
            variant="outline" 
            className="bg-purple-50 text-purple-800 border-none text-xs"
          >
            {category}
          </Badge>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-6 py-0 px-2 border-purple-200 hover:bg-purple-50"
          onClick={onClick}
          aria-label={isOffering ? 'Learn more about this skill' : 'Help with this skill request'}
        >
          {isOffering ? 'Learn' : 'Help'}
        </Button>
      </div>
    </div>
  );
};

export default SkillActivityContent;
