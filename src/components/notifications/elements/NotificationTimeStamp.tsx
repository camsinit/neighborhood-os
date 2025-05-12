
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

export interface NotificationTimeStampProps {
  date: string | Date;
  isUnread?: boolean;
  className?: string;
  format?: "short" | "verbose";
  position?: "inline" | "corner";
}

/**
 * Creates a concise time representation like "5m" or "2h"
 */
const getShortRelativeTime = (date: Date): string => {
  const fullRelative = formatDistanceToNow(date, { addSuffix: false });
  const match = fullRelative.match(/^(\d+)\s+(\w+)/);
  if (!match) return fullRelative;
  
  const [_, num, unit] = match;
  
  // Map to abbreviated units
  const shortUnit = 
    unit.startsWith('second') ? 's' :
    unit.startsWith('minute') ? 'm' :
    unit.startsWith('hour') ? 'h' :
    unit.startsWith('day') ? 'd' :
    unit.startsWith('week') ? 'w' :
    unit.startsWith('month') ? 'mo' :
    unit.startsWith('year') ? 'y' :
    unit.charAt(0);
  
  return `${num}${shortUnit}`;
};

/**
 * Renders a minimal timestamp for notification items
 */
const NotificationTimeStamp: React.FC<NotificationTimeStampProps> = ({
  date,
  isUnread = false,
  className,
  format = "short",
  position = "corner"
}) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  // Format based on preference
  const timeText = format === "short"
    ? getShortRelativeTime(dateObj)
    : formatDistanceToNow(dateObj, { addSuffix: true });
  
  return (
    <div 
      className={cn(
        "flex items-center gap-1 text-xs",
        isUnread ? "text-gray-700 font-medium" : "text-gray-500",
        position === "corner" && "absolute top-3 right-3",
        className
      )}
    >
      <Clock className="h-3 w-3" />
      <span>{timeText}</span>
    </div>
  );
};

export default NotificationTimeStamp;
