/**
 * Utility functions for highlighting parts of notification titles
 * based on the notification type and module theming
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
  
  // Find the content part to highlight
  // Usually this is the last part of the title after a colon
  // Or it could be the text between quotes
  let contentMatch = null;
  
  // Try to match text after a colon (e.g. "John is hosting: Work Session")
  const colonPattern = /:\s*([^:]+)$/;
  contentMatch = title.match(colonPattern);
  
  // If no colon, try to match quoted content (e.g. "John is offering "Lawn Mower"")
  if (!contentMatch) {
    const quotePattern = /"([^"]+)"|'([^']+)'/;
    contentMatch = title.match(quotePattern);
  }
  
  // If both patterns failed, try to find content after specific verbs
  if (!contentMatch) {
    const verbPattern = /(hosting|offering|requesting|created|shared)\s+(.+)$/i;
    contentMatch = title.match(verbPattern);
    
    // If verb pattern matched, use the capture group after the verb
    if (contentMatch) {
      contentMatch = [contentMatch[0], contentMatch[2]];
    }
  }
  
  // If we found content to highlight
  if (contentMatch && contentMatch[1]) {
    const contentPart = contentMatch[1];
    const titleParts = title.split(contentPart);
    
    // Return JSX with the content part highlighted
    return React.createElement(
      React.Fragment,
      null,
      titleParts[0],
      React.createElement(
        "span",
        { style: { color: color } },
        contentPart
      ),
      titleParts[1] || ""
    );
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
  
  // Default: try to use the content type directly
  return type as keyof typeof moduleThemeColors;
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
