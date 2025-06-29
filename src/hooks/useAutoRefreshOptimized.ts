
/**
 * Optimized Auto Refresh Hook
 * 
 * Simplified version that uses the unified event system
 * and reduces unnecessary re-renders
 */
import { useEffect } from 'react';
import { unifiedEvents, UnifiedEventType } from '@/utils/unifiedEventSystem';

/**
 * Hook to automatically refresh queries when specific events occur
 * 
 * @param queryKeys - React Query keys to invalidate
 * @param eventTypes - Event types to listen for
 * @param refetchFn - Optional custom refetch function
 */
export const useAutoRefreshOptimized = (
  eventTypes: UnifiedEventType[],
  refetchFn: () => void
) => {
  useEffect(() => {
    // Subscribe to all specified event types
    const unsubscribers = eventTypes.map(eventType => 
      unifiedEvents.subscribe(eventType, refetchFn)
    );
    
    // Cleanup subscriptions
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [eventTypes, refetchFn]);
};
