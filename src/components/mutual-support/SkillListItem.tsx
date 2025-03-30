
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
  
  // Extract the requester profile and add validation
  const requesterProfile = profiles?.[0];
  
  const isOwner = user?.id === requesterProfile?.id;

  // When "Learn" or "Help" button is clicked, we just use the onClick handler 
  // from props which will open the appropriate dialog
  const handleScheduleHelp = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user?.id) {
      toast.error("Please log in to continue");
      return;
    }

    // We'll let the parent component handle opening the proper dialog
    onClick();
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
                  // Prevent propagation to parent onClick
                  e.stopPropagation();
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
