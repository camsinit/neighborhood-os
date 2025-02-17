
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2 } from "lucide-react"; // Import the trash icon
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
  requestId: string; // Add requestId prop for deletion
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

  // Handle delete function
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    try {
      const { error } = await supabase
        .from('skills_exchange')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user?.id); // Additional check to ensure only owner can delete

      if (error) throw error;
      
      toast.success("Skill request deleted successfully");
      // Refresh the page or update the list
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
      {/* Avatar section - Now just showing the profile image without the tag */}
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
          <h3 className="text-md font-semibold text-gray-900 group-hover:text-blue-500 transition-colors">{title}</h3>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">{timeAgo}</div>
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
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default SkillListItem;
