
/**
 * NotificationTimeStamp.tsx
 * 
 * A reusable component for displaying notification timestamps
 * with appropriate formatting and styling
 */
import React from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export interface NotificationTimeStampProps {
  date: string | Date;
  isUnread?: boolean;
  className?: string;
  format?: "relative" | "absolute";
  size?: "xs" | "sm";
}

/**
 * Renders a formatted timestamp for notification items
 */
export const NotificationTimeStamp: React.FC<NotificationTimeStampProps> = ({
  date,
  isUnread = false,
  className,
  format = "relative",
  size = "xs"
}) => {
  // Parse the date
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  // Format the date based on the format prop
  const formattedDate = format === "relative" 
    ? formatDistanceToNow(dateObj, { addSuffix: true, includeSeconds: true })
    : dateObj.toLocaleString();
  
  // Determine size class based on size prop
  const sizeClass = size === "xs" ? "text-[11px]" : "text-xs";
  
  return (
    <span 
      className={cn(
        sizeClass,
        isUnread ? "text-gray-700" : "text-gray-500",
        className
      )}
    >
      {formattedDate}
    </span>
  );
};

export default NotificationTimeStamp;
