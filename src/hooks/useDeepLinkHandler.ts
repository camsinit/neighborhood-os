
/**
 * Deep Link Handler Hook
 * 
 * This hook handles URL parameters for direct deep links to specific content items.
 * It automatically highlights items when users navigate via deep links or shared URLs.
 */
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ItemNavigationService } from '@/services/navigation/ItemNavigationService';
import { HighlightableItemType } from '@/utils/highlight/types';
import { highlightItem } from '@/utils/highlight/highlightItem';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useDeepLinkHandler');

/**
 * Hook to handle deep link parameters and trigger highlighting
 * 
 * @param pageType - The type of content this page displays
 */
export const useDeepLinkHandler = (pageType: HighlightableItemType) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Handle deep link parameters
    const deepLinkInfo = ItemNavigationService.handleDeepLinkParams(searchParams);
    
    if (deepLinkInfo.shouldHighlight && deepLinkInfo.type && deepLinkInfo.id) {
      // Verify the content type matches this page
      if (deepLinkInfo.type === pageType) {
        logger.info(`Deep link detected: highlighting ${deepLinkInfo.type} ${deepLinkInfo.id}`);
        
        // Highlight the item after a short delay to ensure DOM is ready
        setTimeout(() => {
          highlightItem(deepLinkInfo.type!, deepLinkInfo.id!, true);
        }, 500);
        
        // Clean up URL parameters after highlighting
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('highlight');
        newParams.delete('type');
        
        // Only update URL if there were parameters to remove
        if (newParams.toString() !== searchParams.toString()) {
          setSearchParams(newParams, { replace: true });
        }
      } else {
        logger.warn(`Deep link type mismatch: expected ${pageType}, got ${deepLinkInfo.type}`);
      }
    }
  }, [searchParams, pageType, setSearchParams]);

  return {
    hasDeepLink: ItemNavigationService.handleDeepLinkParams(searchParams).shouldHighlight
  };
};

export default useDeepLinkHandler;
