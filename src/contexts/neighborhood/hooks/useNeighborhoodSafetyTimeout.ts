
/**
 * Custom hook to manage safety timeouts for neighborhood data fetching
 * 
 * This hook helps prevent infinite loading states by setting timeouts
 * that will force loading states to complete after a set period
 */
import { useState, useCallback, useEffect } from 'react';

/**
 * Hook that provides functions for managing fetch timeouts
 * 
 * @param isLoading - Whether the app is currently in a loading state
 * @param hasFetchAttempted - Whether a fetch attempt has been made
 * @returns Object containing timer control functions
 */
export const useNeighborhoodSafetyTimeout = (
  isLoading: boolean,
  hasFetchAttempted: boolean
) => {
  // Track the current timer ID
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  
  // Function to start the safety timer
  const startFetchTimer = useCallback(() => {
    // Clear any existing timer first
    if (timerId) {
      clearTimeout(timerId);
      setTimerId(null);
    }
    
    // Set a new timer that will force loading to false after 10 seconds
    // This prevents infinite loading states if something goes wrong
    const newTimerId = setTimeout(() => {
      console.warn("[useNeighborhoodSafetyTimeout] Safety timeout triggered - forcing loading state to complete");
    }, 10000);
    
    setTimerId(newTimerId);
  }, [timerId]);
  
  // Function to end the safety timer
  const endFetchTimer = useCallback(() => {
    if (timerId) {
      clearTimeout(timerId);
      setTimerId(null);
    }
  }, [timerId]);
  
  // Clean up timers when the component unmounts
  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);
  
  // Clear timer if loading completes naturally
  useEffect(() => {
    if (!isLoading && hasFetchAttempted && timerId) {
      clearTimeout(timerId);
      setTimerId(null);
    }
  }, [isLoading, hasFetchAttempted, timerId]);
  
  return {
    startFetchTimer,
    endFetchTimer
  };
};
