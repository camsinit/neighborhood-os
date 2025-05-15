
/**
 * Component for displaying an activity user's avatar
 */
import React from "react";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ActivityAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
}

/**
 * Component that displays a user's avatar with a tooltip showing their name
 */
const ActivityAvatar: React.FC<ActivityAvatarProps> = ({ avatarUrl, displayName }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex-shrink-0 mr-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white">
          <p>{displayName || "Neighbor"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ActivityAvatar;
