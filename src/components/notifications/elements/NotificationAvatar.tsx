
/**
 * NotificationAvatar.tsx
 * 
 * A reusable component for displaying notification avatars with appropriate styling
 */
import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNotificationStyle } from "../utils/notificationStyles";

interface NotificationAvatarProps {
  url?: string;
  name?: string;
  isUnread?: boolean;
  notificationType?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Renders an avatar with appropriate styling based on notification properties
 */
const NotificationAvatar: React.FC<NotificationAvatarProps> = ({
  url,
  name = "N",
  isUnread = false,
  notificationType = "default",
  size = "md"
}) => {
  // Get the notification style based on type
  const style = getNotificationStyle(notificationType);
  const Icon = style.icon;
  
  // Determine size class based on size prop
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };
  
  const avatarSize = sizeClasses[size];
  
  // Calculate icon size based on avatar size
  const iconSize = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };
  
  return (
    <Avatar className={cn(
      avatarSize,
      isUnread ? "ring-2 ring-offset-2" : "ring-0",
      isUnread ? style.borderColor.replace("border-", "ring-") : ""
    )}>
      <AvatarImage src={url} alt={name} />
      <AvatarFallback className={cn(
        style.backgroundColor,
        "flex items-center justify-center"
      )}>
        {url ? name.charAt(0).toUpperCase() : (
          <Icon className={cn(
            style.textColor,
            iconSize[size]
          )} />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default NotificationAvatar;
