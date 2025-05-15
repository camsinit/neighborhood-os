/**
 * NotificationBadge.tsx
 * 
 * A reusable badge component for notifications
 */
import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NotificationBadgeProps {
  label?: string;
  count?: number; // Added count property for number badges
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

/**
 * Badge component for showing category or status in notifications
 */
const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  label,
  count,
  variant = "default",
  className
}) => {
  // If count is provided, show as a number badge
  if (count !== undefined) {
    return (
      <Badge 
        variant="destructive" 
        className={cn(
          "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs",
          className
        )}
      >
        {count > 9 ? '9+' : count}
      </Badge>
    );
  }
  
  // Otherwise, show as a label badge
  return (
    <Badge 
      variant={variant} 
      className={cn("text-xs font-medium", className)}
    >
      {label}
    </Badge>
  );
};

export default NotificationBadge;
