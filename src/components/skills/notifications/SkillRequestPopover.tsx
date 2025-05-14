
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Pencil, Trash2 } from "lucide-react"; // Updated imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SkillRequestNotification } from "../types/skillTypes";
import { refreshEvents } from "@/utils/refreshEvents";

interface SkillRequestPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: SkillRequestNotification;
  onClose?: () => void; // New optional onClose callback
}

const SkillRequestPopover: React.FC<SkillRequestPopoverProps> = ({
  open,
  onOpenChange,
  notification,
  onClose
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const queryClient = useQueryClient();
  
  const handleScheduleSession = async () => {
    try {
      setIsConfirming(true);
      
      // Simulate scheduling logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['skill-sessions'] });
      
      // Trigger refresh events
      refreshEvents.skills();
      refreshEvents.notifications();
      
      // Call onClose if provided
      if (onClose) onClose();
      onOpenChange(false);
    } catch (error) {
      console.error("Error scheduling session:", error);
    } finally {
      setIsConfirming(false);
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
        
        {/* Time preferences */}
        {notification.timePreferences && notification.timePreferences.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Time Preferences
            </h4>
            <div className="flex flex-wrap gap-2">
              {notification.timePreferences.map((time, index) => (
                <span key={index} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">
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
          <Button 
            onClick={handleScheduleSession} 
            disabled={isConfirming}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isConfirming ? "Scheduling..." : "Schedule Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SkillRequestPopover;
