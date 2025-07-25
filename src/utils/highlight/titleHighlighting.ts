
/**
 * Utility functions for highlighting parts of notification titles
 * based on the notification type and module theming
 * FIXED: Improved pattern matching and color application for better highlighting
 */
import { moduleThemeColors } from "@/theme/moduleTheme";
import React from "react";

/**
 * Takes a notification title and content type and returns the JSX with
 * the content-specific text highlighted in the appropriate module color
 * 
 * @param title The full notification title string
 * @param contentType The type of content (event, skills, etc)
 * @returns JSX element with highlighted text parts
 */
export const highlightTitleContent = (
  title: string,
  contentType?: string
): React.ReactNode => {
  // If no content type or title, just return the title as is
  if (!contentType || !title) {
    return title;
  }

  // Determine the module type based on content type
  // This handles cases like "skills_exchange" -> "skills"
  const moduleType = getModuleType(contentType);
  
  // If we couldn't determine a color, return the title unchanged
  if (!moduleType) {
    return title;
  }
  
  // Get color for the specific module
  const color = getColorForModule(moduleType);
  
  // Enhanced pattern matching for better content detection
  let contentMatch = null;
  
  // Pattern 1: Text after "to" (e.g., "RSVP'd to Training", "interested in your Cooking skill")
  const toPattern = /\s+to\s+(.+?)(?:\s+(?:event|skill|session))?$/i;
  contentMatch = title.match(toPattern);
  
  // Pattern 2: Text after "your" (e.g., "interested in your Cooking skill", "commented on your Event Title")
  if (!contentMatch) {
    const yourPattern = /\s+your\s+(.+?)(?:\s+(?:skill|session|request|report|event|about))?$/i;
    contentMatch = title.match(yourPattern);
  }
  
  // Pattern 2a: Special case for "commented on your [title] about" format
  if (!contentMatch) {
    const commentedPattern = /commented on your (.+?) about/i;
    contentMatch = title.match(commentedPattern);
  }
  
  // Pattern 3: Text after a colon (e.g., "John is hosting: Work Session")
  if (!contentMatch) {
    const colonPattern = /:\s*([^:]+)$/;
    contentMatch = title.match(colonPattern);
  }
  
  // Pattern 4: Quoted content (e.g., "John is offering "Lawn Mower"")
  if (!contentMatch) {
    const quotePattern = /"([^"]+)"|'([^']+)'/;
    contentMatch = title.match(quotePattern);
  }
  
  // Pattern 5: Content after specific verbs
  if (!contentMatch) {
    const verbPattern = /(hosting|offering|requesting|created|shared|confirmed|cancelled)\s+(.+?)(?:\s+(?:event|skill|session|item))?$/i;
    const verbMatch = title.match(verbPattern);
    
    if (verbMatch && verbMatch[2]) {
      contentMatch = [verbMatch[0], verbMatch[2]];
    }
  }
  
  // If we found content to highlight
  if (contentMatch && contentMatch[1]) {
    const contentPart = contentMatch[1].trim();
    
    // Find the position of the content in the original title
    const contentIndex = title.indexOf(contentPart);
    
    if (contentIndex !== -1) {
      const beforeText = title.substring(0, contentIndex);
      const afterText = title.substring(contentIndex + contentPart.length);
      
      // Return JSX with the content part highlighted
      return React.createElement(
        React.Fragment,
        null,
        beforeText,
        React.createElement(
          "span",
          { style: { color: color, fontWeight: '600' } }, // Added font weight for better visibility
          contentPart
        ),
        afterText
      );
    }
  }
  
  // Fallback: return original title
  return title;
};

/**
 * Maps content types to module types for color matching
 * 
 * @param contentType The raw content type from the notification
 * @returns The corresponding module type for theming
 */
const getModuleType = (contentType: string): keyof typeof moduleThemeColors | undefined => {
  // Convert contentType to lowercase for case-insensitive matching
  const type = contentType.toLowerCase();
  
  // Map content types to module types
  if (type.includes('event')) {
    return 'calendar';
  }
  if (type.includes('skill')) {
    return 'skills';
  }
  if (type.includes('good')) {
    return 'goods';
  }
  if (type.includes('safety')) {
    return 'safety';
  }
  if (type.includes('neighbor')) {
    return 'neighbors';
  }
  
  // Default: try to use the content type directly if it matches our module types
  if (moduleThemeColors[type as keyof typeof moduleThemeColors]) {
    return type as keyof typeof moduleThemeColors;
  }
  
  return undefined;
};

/**
 * Get the theme color for a specific module
 * 
 * @param moduleType The module type key
 * @returns The CSS color value for that module
 */
const getColorForModule = (moduleType: keyof typeof moduleThemeColors): string => {
  // Try to get the color directly from module theme
  if (moduleThemeColors[moduleType]) {
    return moduleThemeColors[moduleType].primary;
  }
  
  // Fallback to a default color if not found
  return "#6E59A5"; // Default purple
};
