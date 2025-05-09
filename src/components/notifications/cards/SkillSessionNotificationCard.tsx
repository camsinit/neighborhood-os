/**
 * SkillSessionNotificationCard.tsx
 * 
 * Specialized notification card for skill session updates like scheduling,
 * confirmations, or feedback requests.
 */
import React from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./NotificationCard";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { highlightItem } from "@/utils/highlight";
import { useQueryClient } from "@tanstack/react-query";

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
