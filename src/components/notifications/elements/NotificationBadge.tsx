/**
 * NotificationBadge.tsx
 * 
 * A reusable badge component for notifications with various styling options
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Define the props interface for the badge component
export interface NotificationBadgeProps {
  // The text to display in the badge or a count number
  label?: string;
  // For count badge usage
  count?: number;
  // Optional variant to control the badge style
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  // Optional additional class names
  className?: string;
  // Optional click handler
  onClick?: () => void;
}

/**
 * A customizable badge component for notifications
 * Can be used for displaying labels or a count
 */
const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  label, 
  count,
  variant = "default", 
  className,
  onClick
}) => {
  // If count is provided and we're rendering a notification count badge
  if (count !== undefined) {
    // Only show if there are unread notifications
    if (count <= 0) return null;
    
    return (
      <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
        {count > 9 ? '9+' : count}
      </span>
    );
  }
  
  // Otherwise render a standard badge with label
  return (
    <Badge 
      variant={variant} 
      className={cn("font-normal truncate", className)}
      onClick={onClick}
    >
      {label}
    </Badge>
  );
};

export default NotificationBadge;
