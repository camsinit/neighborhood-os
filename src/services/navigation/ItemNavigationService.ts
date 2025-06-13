/**
 * Unified Item Navigation Service
 * 
 * This service centralizes all item-specific navigation logic across the application.
 * It handles deep links, contextual routing, error handling, and provides consistent
 * navigation patterns for all content types.
 */
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { HighlightableItemType } from '@/utils/highlight/types';
import { highlightItem } from '@/utils/highlight/highlightItem';

// Create a dedicated logger for navigation service
const logger = createLogger('ItemNavigationService');

// Route mapping for different content types
const ROUTE_MAP: Record<HighlightableItemType, string> = {
  event: '/calendar',
  safety: '/safety', 
  skills: '/skills',
  goods: '/goods',
  neighbors: '/neighbors'
};

// Readable names for content types
const CONTENT_TYPE_NAMES: Record<HighlightableItemType, string> = {
  event: 'Event',
  safety: 'Safety Update',
  skills: 'Skill',
  goods: 'Item',
  neighbors: 'Neighbor'
};

/**
 * Options for navigation behavior
 */
interface NavigationOptions {
  /** Whether to show a toast notification when item is found */
  showToast?: boolean;
  /** Whether to replace the current history entry instead of pushing */
  replace?: boolean;
  /** Additional URL parameters to include */
  urlParams?: Record<string, string>;
  /** Timeout in milliseconds to wait for element before giving up */
  highlightTimeout?: number;
}

/**
 * Result of a navigation attempt
 */
interface NavigationResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * ItemNavigationService - Unified service for all item navigation
 */
export class ItemNavigationService {
  private navigate: NavigateFunction;
  
  constructor(navigate: NavigateFunction) {
    this.navigate = navigate;
  }
  
  /**
   * Navigate to an item and highlight it with comprehensive error handling
   */
  async navigateToItem(
    type: HighlightableItemType,
    id: string,
    options: NavigationOptions = {}
  ): Promise<NavigationResult> {
    const {
      showToast = false,
      replace = false,
      urlParams = {},
      highlightTimeout = 2000
    } = options;
    
    try {
      logger.info(`Navigating to ${type} with ID: ${id}`);
      
      // Get the target route
      const route = ROUTE_MAP[type];
      if (!route) {
        const error = `No route defined for content type: ${type}`;
        logger.error(error);
        return { success: false, error };
      }
      
      // Build URL with parameters including highlight info
      const searchParams = new URLSearchParams({
        highlight: id,
        type: type,
        ...urlParams
      });
      
      const fullRoute = `${route}?${searchParams.toString()}`;
      
      // Navigate to the route
      this.navigate(fullRoute, { replace });
      
      // Set up highlighting with timeout
      const highlightPromise = this.attemptHighlight(type, id, highlightTimeout);
      
      if (showToast) {
        const itemName = CONTENT_TYPE_NAMES[type];
        toast.success(`Navigating to ${itemName}...`);
      }
      
      // Wait for highlight attempt to complete
      const highlightSuccess = await highlightPromise;
      
      if (highlightSuccess) {
        logger.info(`Successfully navigated and highlighted ${type}: ${id}`);
        return { 
          success: true, 
          message: `Successfully found ${CONTENT_TYPE_NAMES[type]}` 
        };
      } else {
        logger.warn(`Navigation succeeded but highlighting failed for ${type}: ${id}`);
        return { 
          success: true, 
          message: `Navigated to page but item may not be visible` 
        };
      }
      
    } catch (error) {
      const errorMsg = `Failed to navigate to ${type}: ${error}`;
      logger.error(errorMsg, error);
      
      if (showToast) {
        toast.error(`Navigation failed: ${error}`);
      }
      
      return { success: false, error: errorMsg };
    }
  }
  
  /**
   * Attempt to highlight an item with retry logic
   */
  private async attemptHighlight(
    type: HighlightableItemType,
    id: string,
    timeout: number
  ): Promise<boolean> {
    const retryIntervals = [100, 300, 500, 800, 1200]; // Progressive delays
    const startTime = Date.now();
    
    for (const delay of retryIntervals) {
      // Check if we've exceeded the timeout
      if (Date.now() - startTime > timeout) {
        logger.warn(`Highlight timeout exceeded for ${type}: ${id}`);
        break;
      }
      
      // Wait for the specified delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Try to highlight the item
      try {
        highlightItem(type, id, false); // Don't show toast for individual attempts
        
        // Check if the element exists now (simple DOM check)
        const selector = `[data-${type}-id="${id}"]`;
        const element = document.querySelector(selector);
        
        if (element) {
          logger.info(`Successfully highlighted ${type}: ${id} after ${Date.now() - startTime}ms`);
          return true;
        }
      } catch (error) {
        logger.debug(`Highlight attempt failed: ${error}`);
      }
    }
    
    return false;
  }
  
  /**
   * Navigate with context awareness - determines best route based on current page
   */
  async navigateWithContext(
    type: HighlightableItemType,
    id: string,
    currentPath: string,
    options: NavigationOptions = {}
  ): Promise<NavigationResult> {
    // If we're already on the correct page, just highlight
    const targetRoute = ROUTE_MAP[type];
    const currentBasePath = currentPath.split('?')[0];
    
    if (currentBasePath === targetRoute) {
      logger.info(`Already on correct page for ${type}, just highlighting`);
      
      try {
        highlightItem(type, id, options.showToast || false);
        return { 
          success: true, 
          message: `Highlighted ${CONTENT_TYPE_NAMES[type]} on current page` 
        };
      } catch (error) {
        logger.error(`Failed to highlight on current page: ${error}`);
        return { success: false, error: `Failed to highlight: ${error}` };
      }
    }
    
    // Otherwise, navigate to the correct page
    return this.navigateToItem(type, id, options);
  }
  
  /**
   * Handle URL parameters for direct deep links
   */
  static handleDeepLinkParams(searchParams: URLSearchParams): {
    shouldHighlight: boolean;
    type?: HighlightableItemType;
    id?: string;
  } {
    const highlightId = searchParams.get('highlight');
    const contentType = searchParams.get('type') as HighlightableItemType;
    
    if (highlightId && contentType && ROUTE_MAP[contentType]) {
      return {
        shouldHighlight: true,
        type: contentType,
        id: highlightId
      };
    }
    
    return { shouldHighlight: false };
  }
  
  /**
   * Create a shareable deep link for an item
   */
  static createDeepLink(
    type: HighlightableItemType, 
    id: string, 
    baseUrl: string = window.location.origin
  ): string {
    const route = ROUTE_MAP[type];
    const params = new URLSearchParams({ highlight: id, type });
    return `${baseUrl}${route}?${params.toString()}`;
  }
}

/**
 * Hook factory for creating navigation service instances
 */
export const createItemNavigationService = (navigate: NavigateFunction) => {
  return new ItemNavigationService(navigate);
};

/**
 * Utility function for backward compatibility with existing navigateAndHighlight calls
 */
export const navigateAndHighlight = (
  type: HighlightableItemType,
  id: string,
  navigate: NavigateFunction,
  showToast: boolean = false
): void => {
  const service = new ItemNavigationService(navigate);
  service.navigateToItem(type, id, { showToast });
};

export default ItemNavigationService;
