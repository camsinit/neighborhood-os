
// This custom hook handles drag and drop functionality
import { useState } from "react";
import { toast } from "sonner";

/**
 * Custom hook for handling drag and drop functionality
 * 
 * @param onFileDrop - Callback function to handle dropped files
 * @param validateFile - Optional function to validate files before processing
 * @returns - Drag event handlers and state for managing drag interactions
 */
export const useDragAndDrop = (
  onFileDrop: (file: File) => void,
  validateFile?: (file: File) => boolean
) => {
  // State to track if a user is currently dragging a file over the drop zone
  const [isDragging, setIsDragging] = useState(false);
  
  /**
   * Handles the dragenter event
   * Sets the dragging state to true when files are dragged into the component
   */
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    // Prevent default browser behavior
    e.preventDefault();
    e.stopPropagation();
    // Set dragging state to true
    setIsDragging(true);
  };
  
  /**
   * Handles the dragover event
   * Required to make the element a valid drop target
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Prevent default browser behavior
    e.preventDefault();
    e.stopPropagation();
    // Ensure dragging state is true
    if (!isDragging) setIsDragging(true);
  };
  
  /**
   * Handles the dragleave event
   * Sets the dragging state to false when files are dragged out of the component
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Prevent default browser behavior
    e.preventDefault();
    e.stopPropagation();
    // Set dragging state to false
    setIsDragging(false);
  };
  
  /**
   * Handles the drop event
   * Processes dropped files and passes them to the onFileDrop callback
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    // Prevent default browser behavior
    e.preventDefault();
    e.stopPropagation();
    // Reset dragging state
    setIsDragging(false);
    
    // Get the files from the drop event
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // Get the first file from the drop
    const file = files[0];
    
    // Validate the file if a validation function is provided
    if (validateFile) {
      if (!validateFile(file)) {
        return;
      }
    } else {
      // Default validation for images
      if (!file.type.startsWith('image/')) {
        toast.error(`File "${file.name}" is not an image`);
        return;
      }
    }
    
    // Pass the valid file to the callback function
    onFileDrop(file);
  };

  // Return the event handlers and dragging state
  return {
    isDragging,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};
