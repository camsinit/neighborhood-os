
/**
 * NotificationTimeStamp.tsx
 * 
 * A minimal timestamp component for notifications
 * showing time elapsed since creation
 */
import React from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { getNotificationTextColor } from "../utils/notificationColorUtils";

export interface NotificationTimeStampProps {
  date: string | Date;
  isUnread?: boolean;
  className?: string;
  format?: "short" | "verbose";
  position?: "inline" | "corner";
  notificationType?: string;
}

/**
 * Creates a concise time representation like "5m" or "2h"
 * 
 * This function takes a date and returns a condensed time string format
 * like "5m" for minutes, "2h" for hours, "3d" for days, etc.
 */
const getShortRelativeTime = (date: Date): string => {
  // Get the full relative time string from date-fns
  const fullRelative = formatDistanceToNow(date, { addSuffix: false });
  
  // Extract the number and unit using regex
  // This matches patterns like "5 minutes", "2 hours", etc.
  const match = fullRelative.match(/^(\d+)\s+(\w+)/);
  if (!match) return fullRelative;
  
  const [_, num, unit] = match;
  
  // Map to abbreviated units with special case for months ("mo" instead of "m")
  const shortUnit = 
    unit.startsWith('second') ? 's' :
    unit.startsWith('minute') ? 'm' :
    unit.startsWith('hour') ? 'h' :
    unit.startsWith('day') ? 'd' :
    unit.startsWith('week') ? 'w' :
    unit.startsWith('month') ? 'mo' : // Using "mo" for month to differentiate from minutes
    unit.startsWith('year') ? 'y' :
    unit.charAt(0);
  
  // Return the condensed format (e.g., "5m", "2h", "3d", "1mo")
  return `${num}${shortUnit}`;
};

/**
 * Renders a minimal timestamp for notification items
 * with optional type-specific coloring
 */
const NotificationTimeStamp: React.FC<NotificationTimeStampProps> = ({
  date,
  isUnread = false,
  className,
  format = "short", // Default to short format now
  position = "corner",
  notificationType
}) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  // Format based on preference - now using our condensed format by default
  const timeText = format === "short"
    ? getShortRelativeTime(dateObj)
    : formatDistanceToNow(dateObj, { addSuffix: true });
  
  // Get highlight color if unread and has notification type
  const highlightColor = isUnread && notificationType 
    ? getNotificationTextColor(notificationType)
    : "";
  
  return (
    <div 
      className={cn(
        "flex items-center gap-1 text-xs",
        isUnread ? "text-gray-700 font-medium" : "text-gray-500",
        position === "corner" && "absolute top-3 right-3",
        className
      )}
    >
      <Clock className={cn("h-3 w-3", isUnread && highlightColor)} />
      <span>{timeText}</span>
    </div>
  );
};

export default NotificationTimeStamp;
