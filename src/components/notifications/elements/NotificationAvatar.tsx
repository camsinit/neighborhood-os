
/**
 * NotificationAvatar.tsx
 * 
 * A minimalist avatar component for notifications
 */
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { getNotificationTextColor } from "../utils/notificationColorUtils";

export interface NotificationAvatarProps {
  url?: string | null;
  name: string;
  isUnread?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  notificationType?: string;
}

/**
 * Renders a clean avatar for notification items
 */
export const NotificationAvatar: React.FC<NotificationAvatarProps> = ({
  url,
  name,
  isUnread = false,
  className,
  size = "md",
  notificationType
}) => {
  // Determine size class
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }[size];
  
  // Get text color based on notification type
  const textColorClass = getNotificationTextColor(notificationType);
  
  return (
    <Avatar 
      className={cn(
        sizeClass, 
        "flex-shrink-0", 
        className
      )}
    >
      {url ? (
        <AvatarImage src={url} alt={name} className="object-cover" />
      ) : (
        <AvatarFallback 
          className={cn(
            "bg-gray-100",
            isUnread ? `${textColorClass.replace('text-', 'bg-').replace('-700', '-50')} ${textColorClass}` : "text-gray-600"
          )}
        >
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default NotificationAvatar;
