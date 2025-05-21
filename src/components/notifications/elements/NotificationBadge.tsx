/**
 * NotificationBadge.tsx
 * 
 * A badge component for notification cards to display metadata
 * like categories, status, and other details
 */
import React from "react";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  // Either a label string or a count number should be provided
  label?: string;
  count?: number;
  variant?: "default" | "outline" | "destructive";
  className?: string;
}

/**
 * A badge component for notifications that can display either a text label
 * or a numeric count (e.g., for unread notifications)
 */
const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  label,
  count,
  variant = "default",
  className
}) => {
  // Style based on variant
  const badgeStyles = {
    default: "bg-gray-100 text-gray-700",
    outline: "border border-gray-200 text-gray-600",
    destructive: "bg-red-100 text-red-700"
  };
  
  // If count is provided, we'll use that as the content
  // otherwise we'll use the label
  const content = count !== undefined ? count : label;
  
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs",
      // If we're showing a count and it's greater than 0, use a more prominent style
      count !== undefined && count > 0 ? "bg-red-500 text-white" : badgeStyles[variant],
      className
    )}>
      {content}
    </span>
  );
};

export default NotificationBadge;
