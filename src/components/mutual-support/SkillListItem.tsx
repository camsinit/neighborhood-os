
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HelpCircle } from "lucide-react"; // Changed from QuestionMarkCircle to HelpCircle

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
      className="flex items-start gap-4 pl-10 pr-6 py-3 group hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
    >
      <div className="relative">
        <span className={`absolute -top-2 -left-2 px-2 py-0.5 rounded-full text-xs font-medium ${tagColor} ${tagBg}`}>
          {type}
        </span>
        <Avatar className="h-10 w-10">
          {isUnresolvedRequest ? (
            // Show question mark for unresolved requests
            <AvatarFallback className="bg-gray-100">
              <HelpCircle className="h-6 w-6 text-gray-400" />
            </AvatarFallback>
          ) : (
            // Show profile image or fallback for resolved requests/offers
            profiles && profiles.length > 0 && profiles[0].avatar_url ? (
              <AvatarImage src={profiles[0].avatar_url} alt={profiles[0].display_name || 'User'} />
            ) : (
              <AvatarFallback>
                {profiles && profiles.length > 0 && profiles[0].display_name 
                  ? profiles[0].display_name.charAt(0).toUpperCase()
                  : 'U'
                }
              </AvatarFallback>
            )
          )}
        </Avatar>
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="text-md font-semibold text-gray-900 group-hover:text-blue-500 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
        <div className="text-xs text-gray-400">{timeAgo}</div>
      </div>
    </div>
  );
};

export default SkillListItem;
