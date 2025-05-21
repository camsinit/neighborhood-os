
/**
 * NotificationBadge.tsx
 * 
 * A badge component for notification cards to display metadata
 * like categories, status, and other details
 */
import React from "react";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  label: string;
  variant?: "default" | "outline" | "destructive";
  className?: string;
}

/**
 * A simple badge component for notification cards
 */
const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  label,
  variant = "default",
  className
}) => {
  // Style based on variant
  const badgeStyles = {
    default: "bg-gray-100 text-gray-700",
    outline: "border border-gray-200 text-gray-600",
    destructive: "bg-red-100 text-red-700"
  };
  
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs",
      badgeStyles[variant],
      className
    )}>
      {label}
    </span>
  );
};

export default NotificationBadge;
