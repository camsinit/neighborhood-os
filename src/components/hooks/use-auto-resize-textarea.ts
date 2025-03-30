
/**
 * Custom hook to auto-resize a textarea based on its content
 * This helps create a dynamic height textarea that grows with content and stays within limits
 */
import { useRef, useEffect } from 'react';

interface AutoResizeTextareaOptions {
  minHeight?: number; // Minimum height of the textarea in pixels
  maxHeight?: number; // Maximum height of the textarea in pixels
}

export function useAutoResizeTextarea({ 
  minHeight = 64, 
  maxHeight = 200 
}: AutoResizeTextareaOptions = {}) {
  // Reference to the textarea element
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /**
   * Adjusts the height of the textarea based on its content
   * @param reset Whether to reset the height to minHeight before calculating
   */
  const adjustHeight = (reset = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // If reset is true, set the height to auto to get the correct scrollHeight
    if (reset) {
      textarea.style.height = `${minHeight}px`;
    }

    // Calculate the new height based on content
    const scrollHeight = textarea.scrollHeight;
    
    // Apply constraints (min and max height)
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    
    // Set the new height
    textarea.style.height = `${newHeight}px`;
  };

  // Adjust height on initial render
  useEffect(() => {
    adjustHeight();
  }, []);

  return {
    textareaRef,
    adjustHeight
  };
}
