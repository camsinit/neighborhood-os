
/**
 * SkillRequestNotificationCard.tsx
 * 
 * Specialized notification card for skill request notifications.
 * This includes accept/decline actions and skill request details.
 */
import React, { useState } from "react";
import { BaseNotification } from "@/hooks/notifications/types";
import { NotificationCard } from "./NotificationCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { markAsRead } from "@/hooks/notifications";
import { highlightItem } from "@/utils/highlight";
import SkillRequestPopover from "@/components/skills/notifications/SkillRequestPopover";

interface SkillRequestNotificationCardProps {
  notification: BaseNotification;
  onDismiss?: () => void;
}

export const SkillRequestNotificationCard: React.FC<SkillRequestNotificationCardProps> = ({
  notification,
  onDismiss,
}) => {
  // State for tracking loading states and dialog visibility
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Extract skill info from context
  const skillData = notification.context?.skillRequestData || {};
  const skillId = notification.context?.skillId || notification.content_id;
  
  // Get actor name for descriptive text
  const actorName = notification.context?.neighborName || 
    notification.profiles?.display_name || "Someone";
  
  // Generate descriptive text based on notification action
  let actionText = `${actorName} requested your skill`;
  if (notification.action_type === "offer") {
    actionText = `${actorName} offered to share a skill with you`;
  } else if (notification.action_type === "accept") {
    actionText = `${actorName} accepted your skill request`;
  } else if (notification.action_type === "decline") {
    actionText = `${actorName} declined your skill request`;
  }
  
  // Handle viewing skill details
  const handleViewDetails = async () => {
    // Mark as read when viewing details
    if (!notification.is_read) {
      await markAsRead('skills', notification.id);
    }
    
    // Navigate to the skill details
    highlightItem('skills', skillId, true);
    
    if (onDismiss) onDismiss();
  };

  // Handle accepting a skill request
  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAccepting(true);
    
    try {
      // First mark the notification as read
      if (!notification.is_read) {
        await markAsRead('skills', notification.id);
      }
      
      // Open the details dialog
      setIsDetailsOpen(true);
      
    } catch (error) {
      console.error("Error accepting skill request:", error);
      toast.error("Failed to accept skill request");
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle declining a skill request
  const handleDecline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeclining(true);
    
    try {
      // Mark as read
      if (!notification.is_read) {
        await markAsRead('skills', notification.id);
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
        
        if (onDismiss) onDismiss();
      }
    } catch (error) {
      console.error("Error declining skill request:", error);
      toast.error("Failed to decline skill request");
    } finally {
      setIsDeclining(false);
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
        {/* Skill request action description */}
        <div className="mt-1 flex items-start gap-1">
          <Lightbulb className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700">
            {actionText}
          </p>
        </div>
        
        {notification.context?.skillTitle && (
          <div className="mt-2">
            <Badge variant="outline" className="font-normal mb-1">
              {notification.context.skillTitle}
            </Badge>
            
            {notification.context?.skillDescription && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {notification.context.skillDescription}
              </p>
            )}
          </div>
        )}
        
        {/* Action buttons for skill request */}
        {notification.context?.actionRequired && (
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="default"
              className="w-full text-xs py-0 h-8 bg-green-500 hover:bg-green-600"
              onClick={handleAccept}
              disabled={isAccepting || isDeclining}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              {isAccepting ? "Loading..." : "Accept"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs py-0 h-8 border-red-200 text-red-500 hover:bg-red-50"
              onClick={handleDecline}
              disabled={isAccepting || isDeclining}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              {isDeclining ? "Loading..." : "Decline"}
            </Button>
          </div>
        )}
      </NotificationCard>
      
      {notification.context?.skillRequestData && (
        <SkillRequestPopover
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          notification={notification.context.skillRequestData}
        />
      )}
    </>
  );
};

export default SkillRequestNotificationCard;
