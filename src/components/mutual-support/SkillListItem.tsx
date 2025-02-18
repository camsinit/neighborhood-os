
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, GraduationCap } from "lucide-react"; // Added GraduationCap for learning
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SkillListItemProps {
  title: string;
  description: string;
  type: "Needs Help" | "Offering Help";
  timeAgo: string;
  borderColor: string;
  tagColor: string;
  tagBg: string;
  onClick: () => void;
  profiles: any[];
  requestId: string;
}

const SkillListItem = ({ 
  title, 
  description, 
  type, 
  timeAgo, 
  borderColor, 
  tagColor, 
  tagBg, 
  onClick,
  profiles,
  requestId
}: SkillListItemProps) => {
  const user = useUser();
  const requesterProfile = profiles[0];
  const isOwner = user?.id === requesterProfile?.id;

  // Handle scheduling helper function
  const handleScheduleHelp = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click

    try {
      // Create a new skill session with default availability
      const defaultAvailability = {
        weekday: false,
        weekend: false,
        morning: false,
        afternoon: false,
        evening: false
      };

      const { data: session, error: sessionError } = await supabase
        .from('skill_sessions')
        .insert({
          skill_id: requestId,
          requester_id: requesterProfile?.id,
          provider_id: user?.id,
          status: 'pending_provider_times',
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          requester_availability: defaultAvailability // Added required field
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Show success message
      toast.success(type === "Needs Help" 
        ? "Great! You've offered to help. Please propose some available time slots."
        : "Great! You've requested to learn. Please share your availability."
      );
      
      // Trigger dialog to add availability
      window.dispatchEvent(new CustomEvent('openSkillSessionDialog', {
        detail: { sessionId: session.id }
      }));
    } catch (error) {
      console.error('Error initiating skill session:', error);
      toast.error("Failed to initiate skill session. Please try again.");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('skills_exchange')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      toast.success("Skill request deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error('Error deleting skill request:', error);
      toast.error("Failed to delete skill request");
    }
  };

  return (
    <div 
      onClick={onClick}
      className="flex items-start gap-3 pl-4 pr-6 py-3 group hover:bg-gray-50 rounded-lg transition-colors cursor-pointer relative"
    >
      {/* Avatar section */}
      <div className="relative">
        <Avatar className="h-10 w-10">
          {requesterProfile?.avatar_url ? (
            <AvatarImage 
              src={requesterProfile.avatar_url} 
              alt={requesterProfile.display_name || 'Neighbor'} 
            />
          ) : (
            <AvatarFallback className="bg-gray-100">
              {requesterProfile?.display_name 
                ? requesterProfile.display_name.charAt(0).toUpperCase()
                : 'N'
              }
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      {/* Content section */}
      <div className="flex flex-col gap-2 flex-grow">
        {/* Title */}
        <h3 className="text-md font-semibold text-gray-900 group-hover:text-blue-500 transition-colors">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
        
        {/* Date and Actions row */}
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs text-gray-400">{timeAgo}</div>
          
          {/* Action buttons - Always visible */}
          <div className="flex items-center gap-2">
            {/* Show appropriate action button based on type, if not owner */}
            {!isOwner && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={handleScheduleHelp}
              >
                {type === "Needs Help" ? (
                  <>
                    <Calendar className="h-4 w-4" />
                    I can help!
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4" />
                    I want to learn!
                  </>
                )}
              </Button>
            )}
            
            {/* Delete button for owner */}
            {isOwner && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Delete request"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillListItem;
