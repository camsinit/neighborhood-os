
/**
 * NotificationBadge.tsx
 * 
 * A reusable component for displaying notification type badges and status indicators
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface NotificationBadgeProps {
  label: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "success" | "warning" | "info";
  isHighlighted?: boolean;
  className?: string;
  size?: "sm" | "default";
}

/**
 * Renders a badge for notification type or status with appropriate styling
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  label,
  variant = "default",
  isHighlighted = false,
  className,
  size = "default"
}) => {
  // Determine size class based on size prop
  const sizeClass = size === "sm" ? "text-[10px] h-5" : "";
  
  return (
    <Badge 
      variant={isHighlighted ? "default" : variant} 
      className={cn(
        sizeClass,
        // Add font-normal if not highlighted
        !isHighlighted && variant === "outline" && "font-normal",
        className
      )}
    >
      {label}
    </Badge>
  );
};

export default NotificationBadge;
