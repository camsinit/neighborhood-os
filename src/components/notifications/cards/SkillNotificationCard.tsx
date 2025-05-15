
/**
 * SkillNotificationCard.tsx
 * 
 * Specialized notification card for skills exchange notifications.
 * This component handles various skill-related notification types.
 */
import React, { useState } from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./base/NotificationCard";
import { Button } from "@/components/ui/button";
import { Check, Calendar, Lightbulb } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { markAsRead } from "@/hooks/notifications";
import { highlightItem } from "@/utils/highlight";
import { 
  NotificationBadge, 
  NotificationDescription 
} from "../elements";
import SkillRequestPopover from "@/components/skills/notifications/SkillRequestPopover";

interface SkillNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

/**
 * Specialized card for skill-related notifications
 * 
 * Renders different UI based on the notification's context and action type
 */
export const SkillNotificationCard: React.FC<SkillNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // State for dialog visibility
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Extract skill info from context
  const skillData = notification.context?.skillRequestData;
  const skillId = notification.context?.skillId || notification.content_id;
  
  // Get actor name for descriptive text
  const actorName = notification.context?.neighborName || 
    notification.profiles?.display_name || "Someone";
  
  // Determine notification action type and generate appropriate text
  let actionText = `${actorName} shared a skill`;
  let actionIcon = Lightbulb;
  
  if (notification.action_type === "request") {
    actionText = `${actorName} requested your skill`;
  } else if (notification.action_type === "offer") {
    actionText = `${actorName} offered to share a skill with you`;
  } else if (notification.action_type === "accept") {
    actionText = `${actorName} accepted your skill request`;
    actionIcon = Check;
  } else if (notification.action_type === "schedule") {
    actionText = `${actorName} scheduled a skill session`;
    actionIcon = Calendar;
  }
  
  // Handle viewing skill details
  const handleViewDetails = async () => {
    // Mark as read when viewing details
    if (!notification.is_read) {
      await markAsRead('skills', notification.id);
    }
    
    // Navigate to the skill details
    if (skillId) {
      highlightItem('skills', skillId, true);
    }
    
    if (onDismiss) onDismiss();
  };
  
  // Handle opening the skill request details
  const handleOpenDetails = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Mark as read
      if (!notification.is_read) {
        await markAsRead('skills', notification.id);
      }
      
      // Open details dialog
      setIsDetailsOpen(true);
    } catch (error) {
      console.error("Error opening skill details:", error);
      toast.error("Failed to open skill details");
    }
  };

  return (
    <>
      <NotificationCard
        notification={notification}
        onAction={handleViewDetails}
        onDismiss={onDismiss}
        showActions={false}
      >
        {/* Action description */}
        <NotificationDescription
          text={actionText}
          type="skills"
          icon={actionIcon}
          iconColor="indigo-500"
        />
        
        {/* Skill information with badge */}
        {notification.context?.skillTitle && (
          <div className="mt-2">
            <NotificationBadge 
              label={notification.context.skillTitle}
              variant="outline" 
              className="font-normal mb-1"
            />
            
            {notification.context?.skillDescription && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {notification.context.skillDescription}
              </p>
            )}
          </div>
        )}
        
        {/* Action buttons for skill request */}
        {notification.context?.actionRequired && (
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              variant="default"
              className="text-xs py-0 h-8"
              onClick={handleOpenDetails}
            >
              View Request
            </Button>
          </div>
        )}
      </NotificationCard>
      
      {/* Skill request details dialog */}
      {notification.context?.skillRequestData && (
        <SkillRequestPopover
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          notification={notification.context.skillRequestData}
          onClose={onDismiss}
        />
      )}
    </>
  );
};

export default SkillNotificationCard;
