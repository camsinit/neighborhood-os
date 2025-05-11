
/**
 * NotificationAvatar.tsx
 * 
 * A reusable component for displaying user avatars in notifications
 * with appropriate styling based on read status.
 */
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface NotificationAvatarProps {
  url?: string | null;
  name: string;
  isUnread?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Renders an avatar for notification items with fallback to initials
 * and styling based on notification read status
 * 
 * @param url - Optional URL to the avatar image
 * @param name - Name of the user for the avatar (used for alt text and fallback)
 * @param isUnread - Whether the notification is unread (affects styling)
 * @param className - Additional CSS classes to apply
 * @param size - Size of the avatar (sm, md, lg)
 */
export const NotificationAvatar: React.FC<NotificationAvatarProps> = ({
  url,
  name,
  isUnread = false,
  className,
  size = "md"
}) => {
  // Determine size class based on size prop
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }[size];
  
  return (
    <Avatar 
      className={cn(
        sizeClass, 
        "flex-shrink-0", 
        className
      )}
    >
      {url ? (
        <AvatarImage src={url} alt={name} />
      ) : (
        <AvatarFallback 
          className={cn(
            isUnread ? "bg-blue-100 text-blue-600" : "bg-gray-200"
          )}
        >
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default NotificationAvatar;
