
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
  
  // Log the full profiles array to see what we're receiving
  console.log('Profiles data:', profiles);
  
  // Extract the requester profile and add validation
  const requesterProfile = profiles?.[0];
  console.log('Requester profile:', requesterProfile);
  
  const isOwner = user?.id === requesterProfile?.id;

  // Add validation to ensure we have the necessary data
  const validateSessionData = () => {
    if (!user?.id) {
      console.error('No user ID available');
      return false;
    }
    if (!requesterProfile?.id) {
      console.error('No requester profile ID available');
      return false;
    }
    if (!requestId) {
      console.error('No request ID available');
      return false;
    }
    return true;
  };

  const handleScheduleHelp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Log all relevant IDs
    console.log('Session creation attempt:', {
      requestId,
      userId: user?.id,
      requesterProfile: requesterProfile,
      requesterProfileId: requesterProfile?.id,
      type
    });

    // Validate required data before proceeding
    if (!validateSessionData()) {
      toast.error("Unable to create session: Missing required data");
      return;
    }

    try {
      const defaultAvailability = {
        weekday: false,
        weekend: false,
        morning: false,
        afternoon: false,
        evening: false
      };

      // Get the actual requester ID from the skills_exchange table
      const { data: skillRequest, error: skillError } = await supabase
        .from('skills_exchange')
        .select('user_id')
        .eq('id', requestId)
        .single();

      if (skillError) {
        console.error('Error fetching skill request:', skillError);
        throw skillError;
      }

      console.log('Creating skill session with data:', {
        skill_id: requestId,
        requester_id: skillRequest.user_id,
        provider_id: user?.id,
        defaultAvailability
      });

      const { data: session, error: sessionError } = await supabase
        .from('skill_sessions')
        .insert({
          skill_id: requestId,
          requester_id: skillRequest.user_id,
          provider_id: user?.id,
          status: 'pending_provider_times',
          expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          requester_availability: defaultAvailability
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating skill session:', sessionError);
        throw sessionError;
      }

      console.log('Skill session created successfully:', session);

      toast.success(type === "Needs Help" 
        ? "Great! You've offered to help. Please propose some available time slots."
        : "Great! You've requested to learn. Please share your availability."
      );

      console.log('Dispatching openSkillSessionDialog event with sessionId:', session.id);
      window.dispatchEvent(new CustomEvent('openSkillSessionDialog', {
        detail: { sessionId: session.id }
      }));
    } catch (error) {
      console.error('Detailed error creating skill session:', error);
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
      className="w-full flex items-start gap-3 pl-4 pr-6 py-3 group hover:bg-gray-50 rounded-lg transition-colors cursor-pointer relative"
    >
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
      
      <div className="flex flex-col gap-2 flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-md font-semibold text-gray-900 group-hover:text-blue-500 transition-colors">
              {title}
            </h3>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {!isOwner && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  console.log('Learn/Help button clicked');
                  handleScheduleHelp(e);
                }}
                className="text-xs px-3 py-1 h-7"
              >
                {type === "Needs Help" ? "I can help!" : "I want to learn!"}
              </Button>
            )}
            
            {isOwner && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 transition-colors h-7 w-7 p-0"
                title="Delete request"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default SkillListItem;
