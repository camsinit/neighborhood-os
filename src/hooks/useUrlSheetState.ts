/**
 * useUrlSheetState Hook
 * 
 * Manages side panel/sheet state based on URL parameters for consistent
 * deep linking across all pages. This hook:
 * - Reads the 'detail' URL parameter to determine if a sheet should be open
 * - Manages the sheet open/close state
 * - Updates the URL when sheets are opened/closed
 * - Provides data fetching state for the detailed item
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HighlightableItemType } from '@/utils/highlight/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useUrlSheetState');

interface UseUrlSheetStateOptions {
  /** The content type this hook is managing */
  contentType: HighlightableItemType;
  /** Optional function to fetch item data */
  fetchItem?: (id: string) => Promise<any>;
}

interface UseUrlSheetStateReturn {
  /** Whether the sheet should be open */
  isSheetOpen: boolean;
  /** The ID of the item to show in the sheet */
  detailItemId: string | null;
  /** The fetched item data (if fetchItem was provided) */
  detailItem: any | null;
  /** Loading state for item fetching */
  isLoadingItem: boolean;
  /** Error state for item fetching */
  itemError: string | null;
  /** Function to open sheet with specific item */
  openSheet: (itemId: string, item?: any) => void;
  /** Function to close the sheet */
  closeSheet: () => void;
}

export function useUrlSheetState({
  contentType,
  fetchItem
}: UseUrlSheetStateOptions): UseUrlSheetStateReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);
  
  // Get the detail ID from URL parameters
  const detailItemId = searchParams.get('detail');
  const paramType = searchParams.get('type') as HighlightableItemType;
  
  // Sheet should be open if we have a detail ID for the correct content type
  const isSheetOpen = Boolean(detailItemId && paramType === contentType);
  
  // Effect to fetch item data when detail ID changes
  useEffect(() => {
    if (detailItemId && paramType === contentType && fetchItem) {
      setIsLoadingItem(true);
      setItemError(null);
      
      logger.info(`Fetching ${contentType} item:`, detailItemId);
      
      fetchItem(detailItemId)
        .then((item) => {
          setDetailItem(item);
          setIsLoadingItem(false);
          logger.info(`Successfully fetched ${contentType} item:`, detailItemId);
        })
        .catch((error) => {
          const errorMsg = `Failed to fetch ${contentType} item: ${error.message}`;
          setItemError(errorMsg);
          setIsLoadingItem(false);
          logger.error(errorMsg, error);
        });
    } else if (!detailItemId) {
      // Clear item data when no detail ID
      setDetailItem(null);
      setIsLoadingItem(false);
      setItemError(null);
    }
  }, [detailItemId, paramType, contentType, fetchItem]);
  
  // Function to open sheet with specific item
  const openSheet = (itemId: string, item?: any) => {
    logger.info(`Opening ${contentType} sheet for item:`, itemId);
    
    // If item data is provided, use it directly
    if (item) {
      setDetailItem(item);
    }
    
    // Update URL to include detail parameter
    const newParams = new URLSearchParams(searchParams);
    newParams.set('detail', itemId);
    newParams.set('type', contentType);
    setSearchParams(newParams);
  };
  
  // Function to close the sheet
  const closeSheet = () => {
    logger.info(`Closing ${contentType} sheet`);
    
    // Clear item data
    setDetailItem(null);
    setIsLoadingItem(false);
    setItemError(null);
    
    // Remove detail parameter from URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('detail');
    newParams.delete('type');
    setSearchParams(newParams);
  };
  
  return {
    isSheetOpen,
    detailItemId,
    detailItem,
    isLoadingItem,
    itemError,
    openSheet,
    closeSheet
  };
}