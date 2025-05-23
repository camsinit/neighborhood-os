
/**
 * NotificationContent.tsx
 * 
 * A reusable component for rendering the content of notification items
 * with natural language formatting
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
 * Component for rendering the main content of a notification with natural language formatting
 * This component directly parses and highlights important content
 * 
 * Now updated to prevent double "neighbor name" when notification cards already process the name
 */
const NotificationContent: React.FC<NotificationContentProps> = ({
  title,
  actorName,
  contentType,
  isUnread = false,
  className,
  children
}) => {
  // Format the title to be more conversational
  // Check if title already starts with actorName to avoid duplication
  const titleAlreadyHasActor = actorName && title.startsWith(actorName);
  const formattedTitle = !titleAlreadyHasActor && actorName ? `${actorName} ${title}` : title;

  // Get text color for highlighted content based on notification type
  const highlightColor = getNotificationTextColor(contentType);

  // Parse title into parts to create a natural sentence with highlights
  // But ONLY highlight the specific item name, not any other text
  const renderNaturalSentence = (text: string, type?: string) => {
    // For event notifications - "Person posted Event Name"
    if (type === 'event' || type === 'calendar') {
      const matches = text.match(/(.+?) (posted|shared|created|updated|cancelled|is hosting) (.+)/i);
      if (matches && matches.length >= 4) {
        return <>
            {matches[1]} {matches[2]}{' '}
            <span className={cn("font-medium", highlightColor)}>
              {matches[3]}
            </span>
          </>;
      }
    }

    // For safety notifications - "Person posted safety update Title"
    if (type === 'safety') {
      // Handle comment on safety update
      if (text.includes("comment on")) {
        const parts = text.split("comment on");
        if (parts.length > 1) {
          return <>
            {parts[0]}commented on your safety update{' '}
            <span className={cn("font-medium", highlightColor)}>
              {parts[1].trim()}
            </span>
          </>;
        }
      }
      
      // Handle regular safety alerts
      // UPDATED: Only highlight the title, not "safety alert"
      const matches = text.match(/(.+?) (posted|shared|reported) (?:safety alert:)?\s*(.+)/i);
      if (matches && matches.length >= 4) {
        return <>
            {matches[1]} {matches[2]} safety alert{' '}
            <span className={cn("font-medium", highlightColor)}>
              {matches[3]}
            </span>
          </>;
      }
    }

    // For goods notifications - "Person is offering Item"
    if (type === 'goods') {
      const matches = text.match(/(.+?) (is offering|is looking for|posted|claimed|removed) (.+)/i);
      if (matches && matches.length >= 4) {
        return <>
            {matches[1]} {matches[2]}{' '}
            <span className={cn("font-medium", highlightColor)}>
              {matches[3]}
            </span>
          </>;
      }
    }

    // For skills notifications - natural sentences
    if (type === 'skills') {
      const matches = text.match(/(.+?) (requested|confirmed|completed|scheduled|cancelled|is sharing|shared) (.+)/i);
      if (matches && matches.length >= 4) {
        return <>
            {matches[1]} {matches[2]}{' '}
            <span className={cn("font-medium", highlightColor)}>
              {matches[3]}
            </span>
          </>;
      }
    }

    // For neighbors notifications - NOW highlight just the name, not the entire phrase
    if (type === 'neighbors' || type === 'neighbor_welcome') {
      const matches = text.match(/(.+?) (joined|updated|added)/i);
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
    // Only highlight the specific content, not the verb or action
    const defaultMatches = text.match(/(.+?) (posted|shared|updated|created|requested|reported) (.+)/i);
    if (defaultMatches && defaultMatches.length >= 4) {
      return <>
          {defaultMatches[1]} {defaultMatches[2]}{' '}
          <span className={cn("font-medium", highlightColor)}>
            {defaultMatches[3]}
          </span>
        </>;
    }

    // If no pattern matches, return the text as is
    return text;
  };
  
  return <div className={cn("flex items-center gap-2 min-w-0", className)}>
      {/* Main notification text with natural sentence highlighting */}
      <p className={cn("text-sm leading-tight", isUnread ? "font-medium text-gray-900" : "text-gray-800")}>
        {renderNaturalSentence(formattedTitle, contentType)}
      </p>
      
      {/* Optional content like description, comment preview, etc. */}
      {children}
    </div>;
};

export default NotificationContent;
