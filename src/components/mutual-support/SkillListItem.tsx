
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"; // Added Button import
import { Trash2, Calendar } from "lucide-react"; // Added Calendar icon
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
  // Get the current user and the profile of the person who made the request
  const user = useUser();
  const requesterProfile = profiles[0];
  const isOwner = user?.id === requesterProfile?.id;

  // Handle scheduling helper function
  const handleScheduleHelp = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click

    try {
      // Create a new skill session
      const { data: session, error: sessionError } = await supabase
        .from('skill_sessions')
        .insert({
          skill_id: requestId,
          requester_id: requesterProfile?.id,
          provider_id: user?.id,
          status: 'pending_provider_times',
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Show success message
      toast.success("Great! You've offered to help. Please propose some available time slots.");
      
      // Trigger dialog to add availability (you'll need to implement this)
      window.dispatchEvent(new CustomEvent('openSkillSessionDialog', {
        detail: { sessionId: session.id }
      }));
    } catch (error) {
      console.error('Error initiating skill session:', error);
      toast.error("Failed to initiate skill session. Please try again.");
    }
  };

  // Handle delete function
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    
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
      <div className="flex flex-col gap-1 flex-grow">
        {/* Title and timestamp row */}
        <div className="flex justify-between items-start">
          <h3 className="text-md font-semibold text-gray-900 group-hover:text-blue-500 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">{timeAgo}</div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Only show help button for needs and if user is not the owner */}
              {type === "Needs Help" && !isOwner && (
                <Button
                  size="sm"
                  className="hidden group-hover:inline-flex gap-2"
                  onClick={handleScheduleHelp}
                >
                  <Calendar className="h-4 w-4" />
                  I can help!
                </Button>
              )}
              
              {/* Only show delete button for the owner */}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete request"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default SkillListItem;
