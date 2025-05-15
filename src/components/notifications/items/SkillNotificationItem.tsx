// Fix the NotificationPopover import and highlightItem calls
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { BaseNotification } from "@/hooks/notifications/types";
import BaseNotificationItem from "./BaseNotificationItem";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { markAsRead } from "@/hooks/notifications";
import { highlightItem } from "@/utils/highlight";
import NotificationPopover from "../NotificationsPopover"; // Fixed import

interface SkillNotificationItemProps {
  notification: BaseNotification;
  onDismiss: () => void;
}

const SkillNotificationItem = ({ notification, onDismiss }: SkillNotificationItemProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const queryClient = useQueryClient();
  
  // Extract metadata
  const metadata = notification?.context || {};
  
  // Handle view action - fixed highlightItem call
  const handleView = async () => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await markAsRead(notification.notification_type, notification.id);
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
    
    // Navigate to skill
    highlightItem('skills', notification.content_id);
    
    // Dismiss notification panel
    onDismiss();
  };
  
  // Handle request confirmation - fixed highlightItem call
  const handleAccept = async () => {
    setIsAccepting(true);
    
    try {
      // Mark notification as read
      if (!notification.is_read) {
        await markAsRead(notification.notification_type, notification.id);
      }
      
      // For skill sessions, navigate to the session calendar
      if (metadata.metadata?.event_id) {
        highlightItem('event', metadata.metadata.event_id);
      } else {
        highlightItem('skills', notification.content_id);
      }
      
      onDismiss();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    } finally {
      setIsAccepting(false);
    }
  };
  
  // Handle request decline
  const handleDecline = async () => {
    setIsDeclining(true);
    
    try {
      // Mark notification as read
      if (!notification.is_read) {
        await markAsRead(notification.notification_type, notification.id);
      }
      
      // Update the skill session status to declined
      if (notification.content_id) {
        const { error } = await supabase
          .from('skill_sessions')
          .update({ status: 'expired' })
          .eq('id', notification.content_id);
          
        if (error) throw error;
        
        toast.success("Skill request declined");
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['skill-sessions'] });
        
        onDismiss();
      }
    } catch (error) {
      console.error("Error declining request:", error);
      toast.error("Failed to decline request");
    } finally {
      setIsDeclining(false);
    }
  };
  
  // Format session time
  const sessionTime = metadata.sessionTime ? parseISO(metadata.sessionTime) : null;
  
  // Render component
  return (
    <BaseNotificationItem
      notification={notification}
      onDismiss={onDismiss}
      renderActions={() => (
        <div className="mt-2 flex gap-2">
          {notification.action_type === 'request' && (
            <>
              <Button
                size="sm"
                variant="default"
                className="w-full text-xs py-0 h-7 bg-green-500 hover:bg-green-600"
                onClick={handleAccept}
                disabled={isAccepting || isDeclining}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                {isAccepting ? "Loading..." : "Accept"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs py-0 h-7 border-red-200 text-red-500 hover:bg-red-50"
                onClick={handleDecline}
                disabled={isAccepting || isDeclining}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                {isDeclining ? "Loading..." : "Decline"}
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={handleView}>
            View
          </Button>
        </div>
      )}
    >
      {notification.action_type === 'request' && (
        <div className="text-sm text-gray-600">
          {metadata.skillTitle && (
            <p className="font-medium">{metadata.skillTitle}</p>
          )}
          {sessionTime && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(sessionTime, 'PPp')}</span>
            </div>
          )}
        </div>
      )}
    </BaseNotificationItem>
  );
};

export default SkillNotificationItem;
