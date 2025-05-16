
/**
 * NotificationTimeStamp.tsx
 * 
 * A reusable component for displaying the timestamp of notification items
 */
import React from "react";
import { cn } from "@/lib/utils";
import { getTimeAgo } from "../utils/notificationStyles";

interface NotificationTimeStampProps {
  date: string;
  isUnread?: boolean;
  position?: "corner" | "inline";
  className?: string;
}

/**
 * Component for rendering a human-readable timestamp for notifications
 */
const NotificationTimeStamp: React.FC<NotificationTimeStampProps> = ({
  date,
  isUnread = false,
  position = "inline",
  className
}) => {
  // Format the timestamp as a human-readable string
  const timeAgo = getTimeAgo(date);
  
  // Determine the position-dependent classes
  const positionClasses = position === "corner" 
    ? "absolute top-2 right-3" 
    : "inline-block";
  
  return (
    <span className={cn(
      "text-xs",
      isUnread ? "text-gray-900" : "text-gray-500",
      positionClasses,
      className
    )}>
      {timeAgo}
    </span>
  );
};

export default NotificationTimeStamp;
