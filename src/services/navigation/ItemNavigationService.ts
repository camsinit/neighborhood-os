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
import { ItemContextService } from './ItemContextService';
// Centralized route helpers keep neighborhood-aware URL logic simple and consistent
import { ROUTE_MAP, neighborhoodPath, extractNeighborhoodId, isOnBaseRoute } from '@/utils/routes';

// Create a dedicated logger for navigation service
const logger = createLogger('ItemNavigationService');

// Route map now lives in src/utils/routes to avoid duplication
// import { ROUTE_MAP } from '@/utils/routes' (see imports above)

// Readable names for content types
const CONTENT_TYPE_NAMES: Record<HighlightableItemType, string> = {
  event: 'Event',
  safety: 'Safety Update',
  skills: 'Skill',
  goods: 'Item',
  neighbors: 'Neighbor',
  group: 'Group'
};

/**
 * Options for navigation behavior with enhanced contextual navigation
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
  
  // Enhanced contextual options
  /** Auto-open item dialog/sheet after highlighting */
  openDialog?: boolean;
  /** Navigate to specific category (for skills, goods) */
  categoryContext?: string;
  /** Navigate to specific date (for calendar events) */
  dateContext?: Date;
  /** Navigate to specific tab (for multi-tab pages) */
  tabContext?: string;
  /** Pre-populate search query */
  searchContext?: string;
  /** Scroll to specific section */
  scrollToSection?: string;
  /** Calendar view preference (week/month) */
  calendarView?: 'week' | 'month';
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
    options: NavigationOptions = {},
    providedNeighborhoodId?: string
  ): Promise<NavigationResult> {
    const {
      showToast = false,
      replace = false,
      urlParams = {},
      highlightTimeout = 2000
    } = options;
    
    try {
      logger.info(`[NAVIGATION] Starting navigation to ${type} with ID: ${id}`, {
        type,
        id,
        options,
        providedNeighborhoodId
      });
      
      // Get the base route pattern - we need to build neighborhood-aware routes
      const baseRoute = ROUTE_MAP[type];
      if (!baseRoute) {
        const error = `No route defined for content type: ${type}`;
        logger.error(error);
        return { success: false, error };
      }
      
      // Build the full neighborhood-aware route via helpers
      // Use provided neighborhood ID first, then fall back to URL extraction
      const neighborhoodId = providedNeighborhoodId || extractNeighborhoodId(window.location.pathname);
      logger.info(`[NAVIGATION] Neighborhood context resolved:`, {
        providedNeighborhoodId,
        extractedFromUrl: extractNeighborhoodId(window.location.pathname),
        finalNeighborhoodId: neighborhoodId,
        currentPathname: window.location.pathname
      });
      
      if (!neighborhoodId) {
        const error = `Cannot determine neighborhood context for navigation`;
        logger.error(`[NAVIGATION] ${error}`, {
          providedNeighborhoodId,
          currentPathname: window.location.pathname
        });
        return { success: false, error };
      }
      
      const fullRoute = neighborhoodPath(baseRoute, neighborhoodId);
      logger.info(`[NAVIGATION] Route constructed:`, {
        baseRoute,
        neighborhoodId,
        fullRoute
      });
      
      // Build URL with parameters including highlight info and context
      const searchParams = new URLSearchParams({
        detail: id, // Use detail parameter for direct sheet opening
        type: type,
        ...urlParams
      });
      
      // Add contextual parameters
      if (options.categoryContext) {
        searchParams.set('category', options.categoryContext);
      }
      if (options.dateContext) {
        searchParams.set('date', options.dateContext.toISOString().split('T')[0]);
      }
      if (options.tabContext) {
        searchParams.set('tab', options.tabContext);
      }
      if (options.searchContext) {
        searchParams.set('q', options.searchContext);
      }
      if (options.scrollToSection) {
        searchParams.set('section', options.scrollToSection);
      }
      if (options.calendarView) {
        searchParams.set('view', options.calendarView);
      }
      
      const fullRouteWithParams = `${fullRoute}?${searchParams.toString()}`;
      logger.info(`[NAVIGATION] Final URL constructed:`, {
        fullRoute,
        searchParams: searchParams.toString(),
        fullRouteWithParams
      });
      
      // Navigate to the route
      logger.info(`[NAVIGATION] Calling navigate with:`, { 
        url: fullRouteWithParams, 
        replace 
      });
      this.navigate(fullRouteWithParams, { replace });
      
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
   * Enhanced navigation with automatic context fetching
   */
  async navigateToItemWithContext(
    type: HighlightableItemType,
    id: string,
    options: NavigationOptions = {}
  ): Promise<NavigationResult> {
    try {
      logger.info(`Starting contextual navigation to ${type}: ${id}`);
      
      // Fetch item context for enhanced navigation
      const context = await ItemContextService.fetchItemContext(type, id);
      
      if (!context) {
        logger.warn(`Could not fetch context for ${type}: ${id}, falling back to basic navigation`);
        return this.navigateToItem(type, id, options);
      }
      
      // Build enhanced navigation options based on context
      const enhancedOptions: NavigationOptions = {
        ...options,
        urlParams: { ...options.urlParams }
      };
      
      // Add context-specific parameters
      switch (type) {
        case 'event':
          if (context.eventDate) {
            enhancedOptions.dateContext = context.eventDate;
          }
          if (context.calendarView) {
            enhancedOptions.calendarView = context.calendarView;
          }
          break;
          
        case 'skills':
          if (context.skillCategory) {
            enhancedOptions.categoryContext = context.skillCategory;
            enhancedOptions.urlParams!['category'] = context.skillCategory;
          }
          if (context.skillType) {
            enhancedOptions.tabContext = context.skillType === 'offer' ? 'offers' : 'requests';
            enhancedOptions.urlParams!['view'] = context.skillType === 'offer' ? 'offers' : 'requests';
          }
          break;
          
        case 'goods':
          if (context.goodsType) {
            enhancedOptions.tabContext = context.goodsType === 'offer' ? 'offers' : 'needs';
          }
          if (context.urgency === 'high') {
            enhancedOptions.scrollToSection = 'urgent';
          }
          break;
          
        case 'safety':
          // Safety updates are chronological, context helps with positioning
          break;
          
        case 'neighbors':
          if (options.openDialog) {
            enhancedOptions.urlParams!['profile'] = 'open';
          }
          break;
          
        case 'group':
          // Groups open in side panel by default via detail parameter
          if (options.openDialog) {
            enhancedOptions.urlParams!['profile'] = 'open';
          }
          break;
      }
      
      logger.info(`Enhanced navigation options for ${type}:`, enhancedOptions);
      
      // Navigate with enhanced context
      return this.navigateToItem(type, id, enhancedOptions);
      
    } catch (error) {
      logger.error(`Error in contextual navigation for ${type}: ${id}`, error);
      // Fall back to basic navigation
      return this.navigateToItem(type, id, options);
    }
  }
  async navigateWithContext(
    type: HighlightableItemType,
    id: string,
    currentPath: string,
    options: NavigationOptions = {}
  ): Promise<NavigationResult> {
    // If we're already on the correct page (ignoring /n/<id> prefix), just highlight
    const baseTargetRoute = ROUTE_MAP[type];
    if (isOnBaseRoute(currentPath, baseTargetRoute)) {
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
   * Handle URL parameters for direct deep links and sheet opening
   */
  static handleDeepLinkParams(searchParams: URLSearchParams): {
    shouldHighlight: boolean;
    shouldOpenSheet: boolean;
    type?: HighlightableItemType;
    id?: string;
  } {
    const detailId = searchParams.get('detail');
    const highlightId = searchParams.get('highlight');
    const contentType = searchParams.get('type') as HighlightableItemType;
    
    // Priority to detail parameter for direct sheet opening
    if (detailId && contentType && ROUTE_MAP[contentType]) {
      return {
        shouldHighlight: true,
        shouldOpenSheet: true,
        type: contentType,
        id: detailId
      };
    }
    
    // Fallback to highlight parameter for highlighting only
    if (highlightId && contentType && ROUTE_MAP[contentType]) {
      return {
        shouldHighlight: true,
        shouldOpenSheet: false,
        type: contentType,
        id: highlightId
      };
    }
    
    return { shouldHighlight: false, shouldOpenSheet: false };
  }
  
  /**
   * Create a shareable deep link for an item with sheet opened
   */
  static createDeepLink(
    type: HighlightableItemType, 
    id: string, 
    baseUrl: string = window.location.origin
  ): string {
    const route = ROUTE_MAP[type];
    const neighborhoodId = extractNeighborhoodId();
    const fullPath = neighborhoodPath(route, neighborhoodId);
    const params = new URLSearchParams({ detail: id, type });
    return `${baseUrl}${fullPath}?${params.toString()}`;
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
