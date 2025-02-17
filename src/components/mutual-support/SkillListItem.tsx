
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
  // Determine if this is an unresolved request
  const isUnresolvedRequest = type === "Needs Help" && (!profiles || profiles.length === 0);

  return (
    <div 
      onClick={onClick}
      className="flex items-start gap-4 pl-10 pr-6 py-3 group hover:bg-gray-50 rounded-lg transition-colors cursor-pointer relative"
    >
      {/* Avatar section */}
      <div className="relative">
        {/* Tag label */}
        <span className={`absolute -top-2 -left-2 px-2 py-0.5 rounded-full text-xs font-medium ${tagColor} ${tagBg}`}>
          {type}
        </span>
        
        {/* Avatar display - simplified for unclaimed requests */}
        {isUnresolvedRequest ? (
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gray-100">
              <HelpCircle className="h-6 w-6 text-gray-400" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-10 w-10">
            {profiles[0]?.avatar_url ? (
              <AvatarImage src={profiles[0].avatar_url} alt={profiles[0].display_name || 'User'} />
            ) : (
              <AvatarFallback>
                {profiles[0]?.display_name 
                  ? profiles[0].display_name.charAt(0).toUpperCase()
                  : 'U'
                }
              </AvatarFallback>
            )}
          </Avatar>
        )}
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
