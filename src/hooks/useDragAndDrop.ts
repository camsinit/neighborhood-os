import { useState, useCallback } from 'react';

interface UseDragAndDropProps {
  onFileDrop: (file: File) => void;
  accept?: string;
}

interface UseDragAndDropReturn {
  isDragOver: boolean;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

/**
 * Hook for handling drag and drop functionality
 * @param onFileDrop - Callback function when a file is dropped
 * @param accept - Accepted file types (optional)
 * @returns Object with drag and drop handlers and state
 */
export const useDragAndDrop = ({
  onFileDrop,
  accept = 'image/*'
}: UseDragAndDropProps): UseDragAndDropReturn => {
  const [isDragOver, setIsDragOver] = useState(false);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];

      // Check file type if accept filter is provided
      if (accept && !file.type.match(accept.replace('*', '.*'))) {
        console.warn(`File type ${file.type} not accepted. Expected: ${accept}`);
        return;
      }

      onFileDrop(file);
    }
  }, [onFileDrop, accept]);

  return {
    isDragOver,
    onDragOver,
    onDragLeave,
    onDrop
  };
};