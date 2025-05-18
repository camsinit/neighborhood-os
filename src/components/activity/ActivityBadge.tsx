
/**
 * Component for displaying an activity badge with detailed action information
 * Now with enhanced resilience to handle inconsistent data structures
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getActivityBadgeLabel, getDetailedActivityLabel } from "./utils/activityLabels";
import { getActivityColor } from "./utils/activityHelpers";
import { cn } from "@/lib/utils";

interface ActivityBadgeProps {
  // The activity type (event, safety, skills, etc.)
  activityType: string;
  // Optional action that specifies what happened with this activity
  // This may be missing in some data sources
  action?: string;
  // Additional class names to apply
  className?: string;
  // Optional title metadata that can help derive the action
  title?: string;
  // Optional metadata object that might contain action hints
  metadata?: Record<string, any>;
}

/**
 * Component that displays a styled badge indicating the specific activity action
 * The badge shows a more detailed description of what happened rather than just the activity type
 * Now with improved resilience to missing action properties and consistent styling
 */
const ActivityBadge: React.FC<ActivityBadgeProps> = ({ 
  activityType, 
  action,
  className,
  title,
  metadata
}) => {
  // Get the appropriate color for this activity type
  const activityColor = getActivityColor(activityType);
  
  // Get the detailed label based on both activity type and action
  // Now also passing title and metadata to help derive the action if not explicitly provided
  const badgeLabel = getDetailedActivityLabel(activityType, action, title, metadata);
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "ml-auto flex-shrink-0 text-sm px-2.5 py-0.5 font-medium", 
        className
      )}
      style={{ 
        backgroundColor: `${activityColor}15`,  // Very light background
        color: activityColor,                   // Text in theme color
        borderColor: `${activityColor}30`       // Slightly darker border
      }}
    >
      {badgeLabel}
    </Badge>
  );
};

export default ActivityBadge;
