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
 * Now with direct text highlighting instead of bracket notation
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

  // Parse and highlight content based on notification type and patterns
  const renderHighlightedContent = (text: string, type?: string) => {
    // Define patterns for different notification types to identify key content to highlight
    const patterns = {
      event: /(shared|updated|created|cancelled|is attending) (.+?)(?:\s|$|\.)/i,
      goods: /(posted|is offering|is looking for|claimed|removed listing for) (.+?)(?:\s|$|\.)/i,
      skills: /(requested|confirmed|completed|scheduled|cancelled) (.+?)(?:\s|$|\.)/i,
      safety: /(reported|posted|shared) (.+?)(?:\s|$|\.)/i,
      neighbors: /^(.+?) (joined|updated)/i
    };
    
    // Default pattern if type doesn't match or is undefined
    const defaultPattern = /(shared|updated|created|posted|requested|reported) (.+?)(?:\s|$|\.)/i;
    
    // Select the appropriate pattern based on the notification type
    const pattern = type && patterns[type.toLowerCase() as keyof typeof patterns] 
      ? patterns[type.toLowerCase() as keyof typeof patterns] 
      : defaultPattern;
    
    // Check if the text matches our pattern
    const match = text.match(pattern);
    
    if (match && match[2]) {
      // We found content to highlight
      const beforeText = text.substring(0, match.index);
      const actionText = match[1]; // The action verb (e.g., "shared", "posted")
      const highlightText = match[2]; // The content to highlight
      const afterText = text.substring(match.index! + match[0].length);
      
      // Return the formatted content with the key part highlighted
      return (
        <>
          {beforeText}
          {actionText}{' '}
          <span className={cn("font-medium", highlightColor)}>
            {highlightText}
          </span>
          {afterText}
        </>
      );
    }
    
    // For neighbors pattern which highlights the actor name
    if (type === 'neighbors') {
      const neighborsMatch = text.match(/^(.+?) (joined|updated)/i);
      if (neighborsMatch) {
        return (
          <>
            <span className={cn("font-medium", highlightColor)}>
              {neighborsMatch[1]}
            </span>
            {' '}{neighborsMatch[2]}{text.substring(neighborsMatch[0].length)}
          </>
        );
      }
    }
    
    // If no pattern matches, return the text unchanged
    return text;
  };

  return (
    <div className={cn("flex flex-col flex-1 min-w-0", className)}>
      {/* Main notification text with smart highlighting */}
      <p 
        className={cn(
          "text-sm leading-tight", 
          isUnread ? "font-medium text-gray-900" : "font-normal text-gray-800"
        )}
      >
        {renderHighlightedContent(formattedTitle, contentType)}
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
