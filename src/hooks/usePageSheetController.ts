/**
 * Universal Page Sheet Controller Hook
 *
 * This hook provides a unified approach to managing sheet states, URL parameters,
 * and item navigation across all pages. It eliminates the fragmented URL management
 * and creates a consistent pattern for deep linking and navigation.
 */
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { HighlightableItemType } from '@/utils/highlight/types';
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
}

export function usePageSheetController({
  contentType,
  fetchItem,
  pageName = contentType
}: UsePageSheetControllerOptions): UsePageSheetControllerReturn {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for sheet management
  const [sheetItem, setSheetItem] = useState<any | null>(null);
  const [isLoadingSheetItem, setIsLoadingSheetItem] = useState(false);
  
  // Parse URL parameters
  const detailParam = searchParams.get('detail');
  const typeParam = searchParams.get('type') as HighlightableItemType;

  // Clean up any corrupted IDs (remove date suffixes like "_2025-07-10")
  const cleanId = (id: string | null): string | null => {
    if (!id) return null;
    // Remove any date suffix pattern (_YYYY-MM-DD)
    return id.replace(/_\d{4}-\d{2}-\d{2}$/, '');
  };

  // Determine sheet state
  const shouldOpenSheet = Boolean(detailParam && typeParam === contentType);
  const sheetItemId = shouldOpenSheet ? cleanId(detailParam) : null;
  
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
    
    // Update URL to include detail parameter while preserving neighborhood context
    const newParams = new URLSearchParams(searchParams);
    newParams.set('detail', cleanedId);
    newParams.set('type', contentType);
    navigate(`${location.pathname}?${newParams.toString()}`);
  };
  
  // Function to close the sheet
  const closeSheet = () => {
    logger.info(`${pageName}: Closing sheet`);
    
    // Clear item data
    setSheetItem(null);
    setIsLoadingSheetItem(false);
    
    // Remove detail parameter from URL while preserving neighborhood context
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('detail');
    newParams.delete('type');
    navigate(`${location.pathname}?${newParams.toString()}`);
  };
  
  return {
    isSheetOpen: shouldOpenSheet,
    sheetItemId,
    sheetItem,
    isLoadingSheetItem,
    openSheet,
    closeSheet
  };
}