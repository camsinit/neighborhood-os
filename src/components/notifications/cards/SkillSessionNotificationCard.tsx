
/**
 * SkillSessionNotificationCard.tsx
 * 
 * Specialized notification card for skill session updates like scheduling,
 * confirmations, or feedback requests.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./base/NotificationCard";
import { Calendar, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { highlightItem } from "@/utils/highlight";
import { useQueryClient } from "@tanstack/react-query";
import { 
  NotificationBadge,
  NotificationDescription
} from "../elements";

interface SkillSessionNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const SkillSessionNotificationCard: React.FC<SkillSessionNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  const queryClient = useQueryClient();
  
  // Extract session info from metadata
  const eventId = notification.context?.metadata?.event_id;
  const skillId = notification.context?.metadata?.skill_id || notification.content_id;
  const sessionTime = notification.context?.sessionTime ? 
    parseISO(notification.context.sessionTime) : null;
  
  // Get actor name for descriptive text
  const actorName = notification.context?.neighborName || 
    notification.profiles?.display_name || "A neighbor";
  
  // Generate descriptive text based on notification action
  let actionText = `${actorName} scheduled a skill session`;
  if (notification.action_type === "request") {
    actionText = `${actorName} requested a skill session`;
  } else if (notification.action_type === "confirm") {
    actionText = `${actorName} confirmed a skill session`;
  } else if (notification.action_type === "cancel") {
    actionText = `${actorName} cancelled a skill session`;
  } else if (notification.action_type === "reschedule") {
    actionText = `${actorName} rescheduled a skill session`;
  } else if (notification.action_type === "complete") {
    actionText = `${actorName} completed a skill session`;
  }
  
  // Handle viewing session details - redirects to calendar if there's an event,
  // otherwise to the skill details
  const handleViewSession = async () => {
    if (eventId) {
      highlightItem('event', eventId, true);
    } else {
      highlightItem('skills', skillId, true);
    }
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notification}
      onAction={handleViewSession}
      onDismiss={onDismiss}
    >
      {/* Session action description using our reusable component */}
      <NotificationDescription
        text={actionText}
        type="skills"
        icon={Clock}
        iconColor="green-500"
      />
      
      {/* Session specific details */}
      <div className="mt-1 text-xs text-gray-600">
        {notification.context?.summary && (
          <p>{notification.context.summary}</p>
        )}
        
        {sessionTime && (
          <div className="mt-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(sessionTime, 'PPp')}</span>
          </div>
        )}
      </div>
      
      {/* View in calendar button if there's an event */}
      {eventId && (
        <div className="mt-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs py-0 h-7"
            onClick={handleViewSession}
          >
            <Calendar className="h-3.5 w-3.5 mr-1" />
            View in Calendar
          </Button>
        </div>
      )}
    </NotificationCard>
  );
};

export default SkillSessionNotificationCard;
