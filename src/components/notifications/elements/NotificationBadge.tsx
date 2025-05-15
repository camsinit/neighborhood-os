
/**
 * NotificationBadge.tsx
 * 
 * A reusable badge component for notifications
 */
import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NotificationBadgeProps {
  label: string;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

/**
 * Badge component for showing category or status in notifications
 */
const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  label,
  variant = "default",
  className
}) => {
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
