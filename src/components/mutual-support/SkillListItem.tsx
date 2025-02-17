import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  return (
    <div 
      onClick={onClick}
      className="flex items-start gap-4 pl-10 pr-6 py-3 group hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
    >
      <div className="relative">
        <span className={`absolute -top-2 -left-2 px-2 py-0.5 rounded-full text-xs font-medium ${tagColor} ${tagBg}`}>{type}</span>
        <Avatar className="h-10 w-10">
          {profiles && profiles.length > 0 && profiles[0].image_url ? (
            <AvatarImage src={profiles[0].image_url} alt={profiles[0].full_name} />
          ) : (
            <AvatarFallback>{profiles && profiles.length > 0 ? profiles[0].full_name : 'N/A'}</AvatarFallback>
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
