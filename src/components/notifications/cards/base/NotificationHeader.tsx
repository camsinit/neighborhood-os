
/**
 * NotificationHeader.tsx
 * 
 * Component for rendering the header section of a notification card
 * including avatar, title, and optional type label
 */
import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { highlightTitleContent } from "@/utils/highlight/titleHighlighting";

// Props for the NotificationHeader component
interface NotificationHeaderProps {
  title: string;
  contentType?: string;
  avatarUrl?: string;
  actorName: string;
  isUnread: boolean;
  showTypeLabel: boolean;
  notificationType?: string;
  onClick?: () => void;
}

/**
 * Component that displays the header of a notification card
 * including the avatar, title, and optional type label
 */
export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  title,
  contentType,
  avatarUrl,
  actorName,
  isUnread,
  showTypeLabel,
  notificationType,
  onClick
}) => {
  return (
    <div 
      className="flex items-start p-3 cursor-pointer gap-3" 
      onClick={onClick}
    >
      {/* Avatar section */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={avatarUrl || ''} alt={actorName} />
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      {/* Content section */}
      <div className="flex-1 space-y-1 pr-6">
        {/* Title with optional type label */}
        <div className="flex items-center gap-2">
          {showTypeLabel && notificationType && (
            <Badge variant="outline" className="text-xs px-1 py-0 h-5">
              {notificationType}
            </Badge>
          )}
          
          <p className={cn(
            "text-sm",
            isUnread ? "font-semibold" : "font-medium"
          )}>
            {/* Use the highlight function for the title */}
            {highlightTitleContent(title, contentType)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationHeader;
