
import React from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Activity } from "@/hooks/useActivities";
import { ActivityGroup } from "@/utils/activityGrouping";
import { getActivityIcon, getActivityColor } from "./utils/activityHelpers";
import { useNavigate } from "react-router-dom";
import { createItemNavigationService } from "@/services/navigation/ItemNavigationService";
import { HighlightableItemType } from "@/utils/highlight/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Props for the SkillsActivityPanel component
 */
interface SkillsActivityPanelProps {
  group: ActivityGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Map activity types to highlightable item types
 */
const getHighlightableType = (activityType: string): HighlightableItemType => {
  const baseType = activityType.split('_')[0];
  
  switch (baseType) {
    case 'skill': return 'skills';
    case 'event': return 'event';
    case 'good': return 'goods';
    case 'safety': return 'safety';
    default: return 'event';
  }
};

/**
 * Get a user-friendly title for the panel based on activity type
 */
const getPanelTitle = (activityType: string, count: number): string => {
  switch (activityType) {
    case 'skill_offered':
      return `${count} Skills Offered`;
    case 'skill_requested':
      return `${count} Skills Requested`;
    case 'good_shared':
      return `${count} Items Shared`;
    case 'good_requested':
      return `${count} Items Requested`;
    case 'event_created':
      return `${count} Events Created`;
    default:
      return `${count} Activities`;
  }
};

/**
 * Component for displaying grouped activities in a side panel
 */
const SkillsActivityPanel = ({ group, open, onOpenChange }: SkillsActivityPanelProps) => {
  const navigate = useNavigate();
  const navigationService = createItemNavigationService(navigate);

  if (!group) return null;

  const { activities, primaryActivity } = group;
  const activityColor = getActivityColor(primaryActivity.activity_type);
  const IconComponent = getActivityIcon(primaryActivity.activity_type);
  
  /**
   * Handle click on individual activity item
   */
  const handleActivityClick = async (activity: Activity) => {
    const itemType = getHighlightableType(activity.activity_type);
    
    try {
      const result = await navigationService.navigateToItem(
        itemType, 
        activity.content_id, 
        { showToast: true }
      );
      
      if (result.success) {
        // Close the panel after successful navigation
        onOpenChange(false);
      } else {
        console.error('Navigation failed:', result.error);
      }
    } catch (error) {
      console.error('Error navigating from activity panel:', error);
    }
  };

  const panelTitle = getPanelTitle(primaryActivity.activity_type, activities.length);
  const actorName = primaryActivity.profiles.display_name || "Neighbor";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px]">
        <SheetHeader className="space-y-4">
          {/* User info header */}
          <div className="flex items-center gap-3 pb-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={primaryActivity.profiles.avatar_url} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <SheetTitle className="text-left">{panelTitle}</SheetTitle>
              <SheetDescription className="text-left">
                by {actorName}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Activity list */}
        <div className="mt-6 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleActivityClick(activity)}
            >
              {/* Activity icon */}
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: `${activityColor}15`,
                  color: activityColor 
                }}
              >
                {IconComponent && (
                  <IconComponent className="h-4 w-4" />
                )}
              </div>
              
              {/* Activity title */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {new Date(activity.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with action button */}
        <div className="mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SkillsActivityPanel;
