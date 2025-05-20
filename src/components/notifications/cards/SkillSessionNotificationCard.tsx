
/**
 * SkillSessionNotificationCard.tsx
 * 
 * Specialized notification card for skill session updates like scheduling,
 * confirmations, or feedback requests.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./base/NotificationCard";
import { Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { highlightItem } from "@/utils/highlight";

interface SkillSessionNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const SkillSessionNotificationCard: React.FC<SkillSessionNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // Extract session info from metadata
  const eventId = notification.context?.metadata?.event_id;
  const skillId = notification.context?.metadata?.skill_id || notification.content_id;
  const sessionTime = notification.context?.sessionTime ? 
    parseISO(notification.context.sessionTime) : null;
  const skillTitle = notification.context?.skillTitle || "a skill session";
  
  // Get actor name for descriptive text
  const actorName = notification.context?.neighborName || 
    notification.profiles?.display_name || "A neighbor";
  
  // Create sentence-style title with proper subject-verb-object structure
  const createSentenceTitle = () => {
    // Different sentence formats based on notification action
    switch(notification.action_type) {
      case "request":
        return `${actorName} requested ${skillTitle}`;
      case "confirm":
        return `${actorName} confirmed ${skillTitle} session`;
      case "cancel":
        return `${actorName} cancelled ${skillTitle} session`;
      case "reschedule":
        return `${actorName} rescheduled ${skillTitle} session`;
      case "complete":
        return `${actorName} completed ${skillTitle} session`;
      default:
        return `${actorName} scheduled ${skillTitle}`;
    }
  };
  
  // Create the sentence-style title
  const sentenceTitle = createSentenceTitle();
  
  // Override the notification title with our sentence format
  const notificationWithSentenceTitle = {
    ...notification,
    title: sentenceTitle
  };
  
  // Handle viewing session details - redirects to calendar if there's an event,
  // otherwise to the skill details - fixed highlightItem calls
  const handleViewSession = async () => {
    if (eventId) {
      highlightItem('event', eventId);
    } else {
      highlightItem('skills', skillId);
    }
    
    if (onDismiss) onDismiss();
  };

  return (
    <NotificationCard
      notification={notificationWithSentenceTitle}
      onAction={handleViewSession}
      onDismiss={onDismiss}
    >
      {/* Session specific details */}
      {sessionTime && (
        <div className="mt-1 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(sessionTime, 'PPp')}</span>
          </div>
        </div>
      )}
      
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
