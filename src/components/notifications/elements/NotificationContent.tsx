
/**
 * NotificationContent.tsx
 * 
 * A reusable component for rendering the content of notification items
 * with minimalist design principles
 */
import React from "react";
import { cn } from "@/lib/utils";
import { getNotificationTextColor } from "../utils/notificationColorUtils";

interface NotificationContentProps {
  title: string;
  actorName?: string;
  contentType?: string;
  isUnread?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Component for rendering the main content of a notification with plain English formatting
 */
const NotificationContent: React.FC<NotificationContentProps> = ({
  title,
  actorName,
  contentType,
  isUnread = false,
  className,
  children
}) => {
  // Format the title to be more human-readable if we have an actor name
  const formattedTitle = actorName 
    ? `${actorName} ${title.toLowerCase()}` 
    : title;
  
  // Get text color for highlighted content based on notification type
  const highlightColor = getNotificationTextColor(contentType);

  // Create a nicely formatted notification content with highlighted terms
  const renderHighlightedContent = (text: string) => {
    // Check for brackets in the text that indicate content to highlight
    const bracketRegex = /\[\[(.*?)\]\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Find all bracketed terms and replace them with highlighted spans
    while ((match = bracketRegex.exec(text)) !== null) {
      // Add the text before the bracketed term
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }
      
      // Add the highlighted term (without brackets)
      parts.push(
        <span 
          key={`highlight-${match.index}`} 
          className={cn("font-medium", highlightColor)}
        >
          {match[1]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last bracketed term
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={cn("flex flex-col flex-1 min-w-0", className)}>
      {/* Main notification text */}
      <p 
        className={cn(
          "text-sm leading-tight", 
          isUnread ? "font-medium text-gray-900" : "font-normal text-gray-800"
        )}
      >
        {renderHighlightedContent(formattedTitle)}
      </p>
      
      {/* Optional description or other content */}
      {children && (
        <div className="mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default NotificationContent;
