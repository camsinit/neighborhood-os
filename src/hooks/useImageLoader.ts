import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for optimized image loading with preloading and error handling
 * 
 * Features:
 * - Progressive loading states (idle -> loading -> loaded/error)
 * - Image preloading for faster perceived performance
 * - Automatic retry logic for failed loads
 * - Memory cleanup to prevent leaks
 */

interface UseImageLoaderOptions {
  /** Enable automatic retry on load failure */
  enableRetry?: boolean;
  /** Number of retry attempts (default: 2) */
  maxRetries?: number;
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Enable preloading for faster perceived performance */
  preload?: boolean;
  /** Placeholder image URL to show while loading */
  placeholder?: string;
}

interface UseImageLoaderReturn {
  /** Current image source (may be placeholder during loading) */
  src: string | null;
  /** Loading state indicator */
  isLoading: boolean;
  /** Error state indicator */
  hasError: boolean;
  /** Whether the actual image has loaded successfully */
  isLoaded: boolean;
  /** Manual retry function */
  retry: () => void;
  /** Reset the loader state */
  reset: () => void;
}

export const useImageLoader = (
  imageUrl: string | null | undefined,
  options: UseImageLoaderOptions = {}
): UseImageLoaderReturn => {
  const {
    enableRetry = true,
    maxRetries = 2,
    retryDelay = 1000,
    preload = true,
    placeholder = null
  } = options;

  // State management for loading process
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);

  // Clean up function to prevent memory leaks
  const cleanup = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setIsLoaded(false);
    setRetryCount(0);
    setLoadedImageUrl(null);
  }, []);

  // Reset function for manual resets
  const reset = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Load image with preloading technique
  const loadImage = useCallback(async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Set up event handlers before setting src
      img.onload = () => {
        setLoadedImageUrl(url);
        setIsLoaded(true);
        setIsLoading(false);
        setHasError(false);
        resolve();
      };
      
      img.onerror = () => {
        setIsLoading(false);
        setHasError(true);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      // Start loading - this triggers the download
      img.src = url;
    });
  }, []);

  // Retry logic with exponential backoff
  const retry = useCallback(async () => {
    if (!imageUrl || retryCount >= maxRetries) return;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Add delay between retries (exponential backoff)
      if (retryCount > 0) {
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, retryCount - 1))
        );
      }
      
      await loadImage(imageUrl);
    } catch (error) {
      console.warn(`Image load attempt ${retryCount + 1} failed:`, error);
      setRetryCount(prev => prev + 1);
      
      // Auto-retry if enabled and under limit
      if (enableRetry && retryCount + 1 < maxRetries) {
        setTimeout(() => retry(), retryDelay);
      }
    }
  }, [imageUrl, retryCount, maxRetries, enableRetry, retryDelay, loadImage]);

  // Main effect to handle image loading
  useEffect(() => {
    // Reset state when URL changes
    cleanup();
    
    if (!imageUrl) {
      return;
    }

    // Start loading process
    setIsLoading(true);
    
    if (preload) {
      // Use preloading technique for better performance
      loadImage(imageUrl).catch(() => {
        // Error handling is already in loadImage
        if (enableRetry && retryCount < maxRetries) {
          setTimeout(() => retry(), retryDelay);
        }
      });
    } else {
      // Direct assignment without preloading
      setLoadedImageUrl(imageUrl);
      setIsLoaded(true);
      setIsLoading(false);
    }

    // Cleanup function
    return cleanup;
  }, [imageUrl, preload, enableRetry, maxRetries, retryDelay, loadImage, retry, cleanup, retryCount]);

  // Determine which source to return
  const src = (() => {
    if (isLoaded && loadedImageUrl) {
      return loadedImageUrl;
    }
    if (isLoading && placeholder) {
      return placeholder;
    }
    return loadedImageUrl;
  })();

  return {
    src,
    isLoading,
    hasError,
    isLoaded,
    retry,
    reset
  };
};