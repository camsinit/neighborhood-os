
/**
 * NotificationContent component
 * 
 * This component handles the main content display of notification cards
 * including title highlighting and any children content.
 */
import React from "react";
import { cn } from "@/lib/utils";
import { highlightTitleContent } from "@/utils/highlight/titleHighlighting";

interface NotificationContentProps {
  title: string;
  contentType?: string; // Add content type for highlighting
  isUnread?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Component for rendering notification content including highlighted title
 */
const NotificationContent: React.FC<NotificationContentProps> = ({
  title,
  contentType,
  isUnread = false,
  children,
  className
}) => {
  // Determine if we should use highlighting based on content type
  const shouldHighlight = !!contentType;
  
  return (
    <div className={cn("flex-1 min-w-0", className)}>
      <p className={cn(
        "text-sm break-words", 
        isUnread ? "font-semibold" : "font-medium"
      )}>
        {/* Use highlighting if we have content type, otherwise plain text */}
        {shouldHighlight ? highlightTitleContent(title, contentType) : title}
      </p>
      
      {/* Render any children content */}
      {children}
    </div>
  );
};

export default NotificationContent;
