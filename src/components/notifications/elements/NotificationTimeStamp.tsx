
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
 * Creates a more concise time representation, like "1d" instead of "1 day ago"
 */
const getShortRelativeTime = (date: Date): string => {
  // Get the full relative time string
  const fullRelative = formatDistanceToNow(date, { addSuffix: false });
  
  // Extract just the number and unit
  const match = fullRelative.match(/^(\d+)\s+(\w+)/);
  if (!match) return fullRelative;
  
  const [_, num, unit] = match;
  
  // Map the unit to a short version
  let shortUnit = '';
  if (unit.startsWith('second')) shortUnit = 's';
  else if (unit.startsWith('minute')) shortUnit = 'm';
  else if (unit.startsWith('hour')) shortUnit = 'h';
  else if (unit.startsWith('day')) shortUnit = 'd';
  else if (unit.startsWith('week')) shortUnit = 'w';
  else if (unit.startsWith('month')) shortUnit = 'mo';
  else if (unit.startsWith('year')) shortUnit = 'y';
  else shortUnit = unit.charAt(0);
  
  // Return the concise format
  return `${num}${shortUnit}`;
};

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
    ? getShortRelativeTime(dateObj)
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
