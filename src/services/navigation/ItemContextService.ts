/**
 * Item Context Service
 * 
 * This service fetches item details to provide contextual information for navigation.
 * It enables the navigation system to understand where items should be displayed
 * and how to set up the correct view state.
 */

import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { HighlightableItemType } from '@/utils/highlight/types';

const logger = createLogger('ItemContextService');

/**
 * Context information for different item types
 */
export interface ItemContextInfo {
  // Common fields
  id: string;
  type: HighlightableItemType;
  title?: string;
  
  // Event-specific context
  eventDate?: Date;
  calendarView?: 'week' | 'month';
  
  // Skills-specific context
  skillCategory?: string;
  skillType?: 'offer' | 'need';
  
  // Goods-specific context
  goodsCategory?: string;
  goodsType?: 'offer' | 'need';
  urgency?: string;
  
  // Safety-specific context
  safetyType?: string;
  timestamp?: Date;
  
  // Neighbors-specific context
  neighborName?: string;
  profileSection?: string;
}

/**
 * Main service class for fetching item context
 */
export class ItemContextService {
  
  /**
   * Fetch context information for any item type
   */
  static async fetchItemContext(
    type: HighlightableItemType, 
    id: string
  ): Promise<ItemContextInfo | null> {
    try {
      logger.info(`Fetching context for ${type}: ${id}`);
      
      switch (type) {
        case 'event':
          return await this.fetchEventContext(id);
        case 'skills':
          return await this.fetchSkillContext(id);
        case 'goods':
          return await this.fetchGoodsContext(id);
        case 'safety':
          return await this.fetchSafetyContext(id);
        case 'neighbors':
          return await this.fetchNeighborContext(id);
        default:
          logger.warn(`Unknown item type: ${type}`);
          return null;
      }
    } catch (error) {
      logger.error(`Error fetching context for ${type} ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch event context including date and title
   */
  private static async fetchEventContext(eventId: string): Promise<ItemContextInfo | null> {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, time, is_recurring')
      .eq('id', eventId)
      .single();
    
    if (error || !data) {
      logger.error('Error fetching event context:', error);
      return null;
    }
    
    const eventDate = new Date(data.time);
    
    return {
      id: data.id,
      type: 'event',
      title: data.title,
      eventDate,
      // Prefer week view for specific events, month view for recurring
      calendarView: data.is_recurring ? 'month' : 'week'
    };
  }
  
  /**
   * Fetch skill context including category and type
   */
  private static async fetchSkillContext(skillId: string): Promise<ItemContextInfo | null> {
    const { data, error } = await supabase
      .from('skills_exchange')
      .select('id, title, skill_category, request_type')
      .eq('id', skillId)
      .single();
    
    if (error || !data) {
      logger.error('Error fetching skill context:', error);
      return null;
    }
    
    return {
      id: data.id,
      type: 'skills',
      title: data.title,
      skillCategory: data.skill_category,
      skillType: data.request_type as 'offer' | 'need'
    };
  }
  
  /**
   * Fetch goods context including category, type, and urgency
   */
  private static async fetchGoodsContext(goodsId: string): Promise<ItemContextInfo | null> {
    const { data, error } = await supabase
      .from('goods_exchange')
      .select('id, title, goods_category, request_type, urgency')
      .eq('id', goodsId)
      .single();
    
    if (error || !data) {
      logger.error('Error fetching goods context:', error);
      return null;
    }
    
    return {
      id: data.id,
      type: 'goods',
      title: data.title,
      goodsCategory: data.goods_category,
      goodsType: data.request_type as 'offer' | 'need',
      urgency: data.urgency
    };
  }
  
  /**
   * Fetch safety context including type and timestamp
   */
  private static async fetchSafetyContext(safetyId: string): Promise<ItemContextInfo | null> {
    const { data, error } = await supabase
      .from('safety_updates')
      .select('id, title, type, created_at')
      .eq('id', safetyId)
      .single();
    
    if (error || !data) {
      logger.error('Error fetching safety context:', error);
      return null;
    }
    
    return {
      id: data.id,
      type: 'safety',
      title: data.title,
      safetyType: data.type,
      timestamp: new Date(data.created_at)
    };
  }
  
  /**
   * Fetch neighbor context including name and profile info
   */
  private static async fetchNeighborContext(neighborId: string): Promise<ItemContextInfo | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', neighborId)
      .single();
    
    if (error || !data) {
      logger.error('Error fetching neighbor context:', error);
      return null;
    }
    
    return {
      id: data.id,
      type: 'neighbors',
      neighborName: data.display_name || 'Neighbor'
    };
  }
  
  /**
   * Enhanced navigation method that fetches context and navigates accordingly
   */
  static async navigateWithContext(
    type: HighlightableItemType,
    id: string,
    navigate: (path: string, options?: { replace?: boolean }) => void,
    options: {
      showToast?: boolean;
      replace?: boolean;
      openDialog?: boolean;
    } = {}
  ): Promise<boolean> {
    try {
      // Fetch item context
      const context = await this.fetchItemContext(type, id);
      
      if (!context) {
        logger.warn(`Could not fetch context for ${type}: ${id}`);
        return false;
      }
      
      // Build navigation parameters based on context
      const params = new URLSearchParams({
        highlight: id,
        type: type
      });
      
      // Add context-specific parameters
      switch (type) {
        case 'event':
          if (context.eventDate) {
            params.set('date', context.eventDate.toISOString().split('T')[0]);
          }
          if (context.calendarView) {
            params.set('view', context.calendarView);
          }
          break;
          
        case 'skills':
          if (context.skillCategory) {
            params.set('category', context.skillCategory);
          }
          if (context.skillType) {
            params.set('tab', context.skillType === 'offer' ? 'offers' : 'requests');
          }
          break;
          
        case 'goods':
          if (context.goodsType) {
            params.set('tab', context.goodsType === 'offer' ? 'offers' : 'needs');
          }
          if (context.urgency === 'high') {
            params.set('section', 'urgent');
          }
          break;
          
        case 'safety':
          // Safety updates are chronological, no special routing needed
          break;
          
        case 'neighbors':
          if (options.openDialog) {
            params.set('profile', 'open');
          }
          break;
      }
      
      if (options.openDialog) {
        params.set('dialog', 'true');
      }
      
      // Navigate with context using centralized route map
      // Import the base route from ROUTE_MAP to avoid hardcoding paths
      const { ROUTE_MAP } = await import('@/utils/routes');
      const targetRoute = ROUTE_MAP[type];
      const fullPath = `${targetRoute}?${params.toString()}`;
      
      logger.info(`Navigating with context to: ${fullPath}`);
      navigate(fullPath, { replace: options.replace });
      
      return true;
      
    } catch (error) {
      logger.error('Error in contextual navigation:', error);
      return false;
    }
  }
}

export default ItemContextService;