
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HelpCircle } from "lucide-react";

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
  profiles
}: SkillListItemProps) => {
  // Get the profile of the person who made the request
  const requesterProfile = profiles[0];

  return (
    <div 
      onClick={onClick}
      className="flex items-start gap-3 pl-4 pr-6 py-3 group hover:bg-gray-50 rounded-lg transition-colors cursor-pointer relative"
    >
      {/* Avatar section */}
      <div className="relative">
        {/* Tag label */}
        <span className={`absolute -top-2 -left-2 px-2 py-0.5 rounded-full text-xs font-medium ${tagColor} ${tagBg}`}>
          {type}
        </span>
        
        {/* Display requester's avatar */}
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
          <div className="text-xs text-gray-400 ml-4">{timeAgo}</div>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default SkillListItem;
