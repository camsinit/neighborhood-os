
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SkillRequestNotification } from "../types/skillTypes";
import { refreshEvents } from "@/utils/refreshEvents";

interface SkillRequestPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: SkillRequestNotification;
  onClose?: () => void;
}

const SkillRequestPopover: React.FC<SkillRequestPopoverProps> = ({
  open,
  onOpenChange,
  notification,
  onClose
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Simplified contact handler - no complex session scheduling
  const handleContactRequester = async () => {
    try {
      // Create a simple notification to connect the skill provider with the requester
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.requesterId,
          actor_id: notification.providerId,
          title: `Skill provider interested in helping with: ${notification.skillTitle}`,
          content_type: 'skills_exchange',
          content_id: notification.skillId,
          notification_type: 'skills',
          action_type: 'contact',
          action_label: 'View Details',
          relevance_score: 3,
          metadata: {
            skillId: notification.skillId,
            skillTitle: notification.skillTitle,
            contextType: 'skill_provider_response'
          }
        });

      if (error) throw error;
      
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      
      // Trigger refresh events
      refreshEvents.skills();
      refreshEvents.notifications();
      
      // Call onClose if provided
      if (onClose) onClose();
      onOpenChange(false);
    } catch (error) {
      console.error("Error contacting requester:", error);
    }
  };

  // Enhanced delete handler with proper error handling
  const handleDeleteRequest = async () => {
    try {
      setIsDeleting(true);
      
      // Delete the skill request from the skills_exchange table
      const { error } = await supabase
        .from('skills_exchange')
        .delete()
        .eq('id', notification.skillId);

      if (error) throw error;
      
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      
      // Trigger refresh events
      refreshEvents.skills();
      refreshEvents.notifications();
      
      // Call onClose if provided
      if (onClose) onClose();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting skill request:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditMode = () => {
    setIsEditing(!isEditing);
    // Here you would implement edit functionality
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex items-center justify-between mb-4">
          <DialogTitle>{notification.skillTitle}</DialogTitle>
          
          {/* Action buttons in header */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleEditMode}
              className="text-gray-600 hover:text-gray-900"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleDeleteRequest}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
        
        {/* Availability information */}
        {notification.availability && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">
              Availability
            </h4>
            <p className="text-sm">{notification.availability}</p>
          </div>
        )}
        
        {/* Info notice */}
        <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
          <p>You can connect with the requester to coordinate sharing your skill directly.</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleContactRequester} 
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Connect with Requester
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SkillRequestPopover;
