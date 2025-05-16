
/**
 * NotificationTimeStamp.tsx
 * 
 * A reusable component for displaying the timestamp of notification items.
 * This component is part of the notification element system and handles
 * formatting and displaying timestamps in a user-friendly manner.
 */
import React from "react";
import { cn } from "@/lib/utils";
import { getTimeAgo } from "../utils/notificationStyles";

/**
 * Props for the NotificationTimeStamp component
 * 
 * @property {string} date - ISO string timestamp for the notification
 * @property {boolean} isUnread - Whether the notification has been read
 * @property {('corner'|'inline')} position - Where the timestamp should appear
 * @property {string} className - Additional CSS classes for styling
 */
interface NotificationTimeStampProps {
  date: string;
  isUnread?: boolean;
  position?: "corner" | "inline";
  className?: string;
}

/**
 * Component for rendering a human-readable timestamp for notifications
 * 
 * This component takes a date string and formats it as a relative time string
 * (e.g., "5 minutes ago", "2 days ago"). It also applies different styling
 * based on whether the notification is read or unread.
 * 
 * @param props - Component props (see NotificationTimeStampProps)
 * @returns A styled timestamp span element
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
