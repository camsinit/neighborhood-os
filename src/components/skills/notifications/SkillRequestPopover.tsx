
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SkillRequestNotification } from "../types/skillTypes";

/**
 * SkillRequestPopover - Displays details about a skill request and allows the provider
 * to schedule a session and create a calendar event.
 * 
 * This component is shown when a skill provider clicks on a notification about a skill request.
 */
interface SkillRequestPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: SkillRequestNotification;
}

const SkillRequestPopover: React.FC<SkillRequestPopoverProps> = ({
  open,
  onOpenChange,
  notification
}) => {
  // State for tracking loading state during confirmations
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Toast for notifications
  const { toast } = useToast();
  
  // Query client for data invalidation
  const queryClient = useQueryClient();
  
  // Handler for confirming and scheduling the skill session
  const handleScheduleSession = async () => {
    try {
      setIsConfirming(true);
      
      // 1. Create a calendar event
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 3); // Default to 3 days from now as example
      
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          title: `Skill Session: ${notification.skillTitle}`,
          description: `Skill exchange session between provider and requester.`,
          time: eventDate.toISOString(), // Use 'time' instead of 'start_time'
          location: 'To be determined',
          host_id: notification.providerId, // Primary host is the provider
          is_private: true,
          neighborhood_id: null, // This needs to be set correctly
        })
        .select()
        .single();
        
      if (eventError) throw eventError;
      
      // 2. Update the skill session status
      if (eventData) {
        // Update the skill session status 
        await supabase
          .from('skill_sessions')
          .update({
            status: 'confirmed', // Using 'confirmed' status
            event_id: eventData.id
          })
          .eq('skill_id', notification.skillId)
          .eq('provider_id', notification.providerId)
          .eq('requester_id', notification.requesterId);
            
        // 3. Send notification to the requester
        await supabase
          .from('notifications')
          .insert({
            user_id: notification.requesterId,
            actor_id: notification.providerId,
            title: `Skill session for "${notification.skillTitle}" has been scheduled`,
            content_type: 'skill_session',
            content_id: notification.skillId,
            notification_type: 'skills',
            action_type: 'view',
            action_label: 'View Calendar',
            metadata: {
              event_id: eventData?.id,
              skill_id: notification.skillId
            }
          });
      }
      
      // Success message and cleanup
      toast({
        title: "Session scheduled successfully!",
        description: "The requester has been notified and the event has been added to the calendar."
      });
      
      // Invalidate relevant queries to update UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['skill-sessions'] });
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error scheduling session:", error);
      toast({
        title: "Failed to schedule session",
        description: "There was an issue scheduling this skill session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Skill Request: {notification.skillTitle}</DialogTitle>
        </DialogHeader>
        
        {/* Requester information */}
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={notification.requesterAvatar || undefined} />
            <AvatarFallback>{notification.requesterName?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{notification.requesterName || 'Anonymous'}</p>
            <p className="text-sm text-muted-foreground">Skill Requester</p>
          </div>
        </div>
        
        {/* Time preferences */}
        {notification.timePreferences && notification.timePreferences.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Time Preferences
            </h4>
            <div className="flex flex-wrap gap-2">
              {notification.timePreferences.map((time, index) => (
                <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {time}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Availability information */}
        {notification.availability && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Availability
            </h4>
            <p className="text-sm">{notification.availability}</p>
          </div>
        )}
        
        {/* Info notice */}
        <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
          <p>By confirming, you'll create a calendar event for this skill session and notify the requester.</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleScheduleSession} disabled={isConfirming}>
            {isConfirming ? "Scheduling..." : "Schedule Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SkillRequestPopover;
