/**
 * Universal Page Sheet Controller Hook
 * 
 * This hook provides a unified approach to managing sheet states, URL parameters,
 * and item navigation across all pages. It eliminates the fragmented URL management
 * and creates a consistent pattern for deep linking and navigation.
 */
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { HighlightableItemType } from '@/utils/highlight/types';
import { highlightItem } from '@/utils/highlight';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PageSheetController');

interface UsePageSheetControllerOptions {
  /** The content type this page manages (e.g., 'event', 'safety', 'goods') */
  contentType: HighlightableItemType;
  /** Optional function to fetch item data for the sheet */
  fetchItem?: (id: string) => Promise<any>;
  /** Page name for logging */
  pageName?: string;
}

interface UsePageSheetControllerReturn {
  /** Whether the sheet should be open */
  isSheetOpen: boolean;
  /** The ID of the item to show in the sheet */
  sheetItemId: string | null;
  /** The fetched item data (if fetchItem was provided) */
  sheetItem: any | null;
  /** Loading state for sheet item */
  isLoadingSheetItem: boolean;
  /** Function to open sheet with specific item */
  openSheet: (itemId: string, item?: any) => void;
  /** Function to close the sheet */
  closeSheet: () => void;
  /** Whether any item should be highlighted */
  shouldHighlight: boolean;
  /** ID of item to highlight */
  highlightItemId: string | null;
}

export function usePageSheetController({
  contentType,
  fetchItem,
  pageName = contentType
}: UsePageSheetControllerOptions): UsePageSheetControllerReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State for sheet management
  const [sheetItem, setSheetItem] = useState<any | null>(null);
  const [isLoadingSheetItem, setIsLoadingSheetItem] = useState(false);
  
  // Parse URL parameters
  const detailParam = searchParams.get('detail');
  const typeParam = searchParams.get('type') as HighlightableItemType;
  const highlightParam = searchParams.get('highlight');
  
  // Clean up any corrupted IDs (remove date suffixes like "_2025-07-10")
  const cleanId = (id: string | null): string | null => {
    if (!id) return null;
    // Remove any date suffix pattern (_YYYY-MM-DD)
    return id.replace(/_\d{4}-\d{2}-\d{2}$/, '');
  };
  
  // Determine sheet state
  const shouldOpenSheet = Boolean(detailParam && typeParam === contentType);
  const sheetItemId = shouldOpenSheet ? cleanId(detailParam) : null;
  
  // Determine highlight state  
  const shouldHighlight = Boolean(
    (detailParam && typeParam === contentType) || 
    (highlightParam && typeParam === contentType)
  );
  const highlightItemId = shouldHighlight ? 
    cleanId(detailParam || highlightParam) : null;
  
  // Legacy parameter support (eventId, goodsId, etc.)
  useEffect(() => {
    const legacyParams = [
      'eventId', 'goodsId', 'skillId', 'safetyId', 'neighborId',
      'updateId' // for safety updates
    ];
    
    let legacyId: string | null = null;
    for (const param of legacyParams) {
      const value = searchParams.get(param);
      if (value) {
        legacyId = cleanId(value);
        break;
      }
    }
    
    if (legacyId) {
      logger.info(`${pageName}: Converting legacy parameter to modern format`);
      highlightItem(contentType, legacyId);
    }
  }, [searchParams, contentType, pageName]);
  
  // Handle highlighting
  useEffect(() => {
    if (highlightItemId) {
      logger.info(`${pageName}: Highlighting item:`, highlightItemId);
      highlightItem(contentType, highlightItemId);
    }
  }, [highlightItemId, contentType, pageName]);
  
  // Fetch sheet item data
  useEffect(() => {
    if (sheetItemId && fetchItem) {
      setIsLoadingSheetItem(true);
      
      logger.info(`${pageName}: Fetching sheet item:`, sheetItemId);
      
      fetchItem(sheetItemId)
        .then((item) => {
          setSheetItem(item);
          setIsLoadingSheetItem(false);
          logger.info(`${pageName}: Successfully fetched sheet item`);
        })
        .catch((error) => {
          console.error(`${pageName}: Failed to fetch sheet item:`, error);
          setSheetItem(null);
          setIsLoadingSheetItem(false);
        });
    } else if (!sheetItemId) {
      // Clear item data when no sheet should be open
      setSheetItem(null);
      setIsLoadingSheetItem(false);
    }
  }, [sheetItemId, fetchItem, pageName]);
  
  // Function to open sheet with specific item
  const openSheet = (itemId: string, item?: any) => {
    const cleanedId = cleanId(itemId);
    if (!cleanedId) return;
    
    logger.info(`${pageName}: Opening sheet for item:`, cleanedId);
    
    // If item data is provided, use it directly
    if (item) {
      setSheetItem(item);
    }
    
    // Update URL to include detail parameter
    const newParams = new URLSearchParams(searchParams);
    newParams.set('detail', cleanedId);
    newParams.set('type', contentType);
    setSearchParams(newParams);
  };
  
  // Function to close the sheet
  const closeSheet = () => {
    logger.info(`${pageName}: Closing sheet`);
    
    // Clear item data
    setSheetItem(null);
    setIsLoadingSheetItem(false);
    
    // Remove detail parameter from URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('detail');
    newParams.delete('type');
    setSearchParams(newParams);
  };
  
  return {
    isSheetOpen: shouldOpenSheet,
    sheetItemId,
    sheetItem,
    isLoadingSheetItem,
    openSheet,
    closeSheet,
    shouldHighlight,
    highlightItemId
  };
}