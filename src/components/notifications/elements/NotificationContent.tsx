
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
  const formattedTitle = actorName ? `${actorName} ${title.toLowerCase()}` : title;

  // Get text color for highlighted content based on notification type
  const highlightColor = getNotificationTextColor(contentType);

  // Parse title into parts to highlight the important content
  const renderHighlightedSentence = (text: string, type?: string) => {
    // For event notifications - "Person is hosting Event Name"
    if (type === 'event' || type === 'calendar') {
      const matches = text.match(/(.+?) (is hosting|created|updated|cancelled) (.+)/i);
      if (matches && matches.length >= 4) {
        return <>
            {matches[1]} {matches[2]}{' '}
            <span className={cn("font-medium", highlightColor)}>
              {matches[3]}
            </span>
          </>;
      }
    }

    // For goods notifications - "Person is offering/looking for Item"
    if (type === 'goods') {
      const matches = text.match(/(.+?) (is offering|is looking for|posted|claimed|removed listing for) (.+)/i);
      if (matches && matches.length >= 4) {
        return <>
            {matches[1]} {matches[2]}{' '}
            <span className={cn("font-medium", highlightColor)}>
              {matches[3]}
            </span>
          </>;
      }
    }

    // For skills notifications
    if (type === 'skills') {
      const matches = text.match(/(.+?) (requested|confirmed|completed|scheduled|cancelled|is sharing) (.+)/i);
      if (matches && matches.length >= 4) {
        return <>
            {matches[1]} {matches[2]}{' '}
            <span className={cn("font-medium", highlightColor)}>
              {matches[3]}
            </span>
          </>;
      }
    }

    // For safety notifications
    if (type === 'safety') {
      const matches = text.match(/(.+?) (reported|posted|shared) (.+)/i);
      if (matches && matches.length >= 4) {
        return <>
            {matches[1]} {matches[2]}{' '}
            <span className={cn("font-medium", highlightColor)}>
              {matches[3]}
            </span>
          </>;
      }
    }

    // For neighbors notifications - highlight the person
    if (type === 'neighbors') {
      const matches = text.match(/(.+?) (joined|updated)/i);
      if (matches && matches.length >= 3) {
        return <>
            <span className={cn("font-medium", highlightColor)}>
              {matches[1]}
            </span>{' '}
            {matches[2]}{text.substring(matches[0].length)}
          </>;
      }
    }

    // Default format for any other notification types
    const defaultMatches = text.match(/(.+?) (shared|updated|created|posted|requested|reported) (.+)/i);
    if (defaultMatches && defaultMatches.length >= 4) {
      return <>
          {defaultMatches[1]} {defaultMatches[2]}{' '}
          <span className={cn("font-medium", highlightColor)}>
            {defaultMatches[3]}
          </span>
        </>;
    }

    // If no pattern matches, just return the text as is
    return text;
  };
  
  // Updated to use flex-row for horizontal alignment
  return <div className={cn("flex flex-row items-center gap-2 min-w-0", className)}>
      {/* Main notification text with smart sentence highlighting */}
      <p className={cn("text-sm leading-tight", isUnread ? "font-medium text-gray-900" : "font-normal text-gray-800")}>
        {renderHighlightedSentence(formattedTitle, contentType)}
      </p>
      
      {/* Optional description or other content */}
      {children}
    </div>;
};
export default NotificationContent;
