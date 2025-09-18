/**
 * Unified Group Activity Types
 * 
 * Core types for the group activity timeline that combines events and updates
 */

import { GroupUpdate } from './groupUpdates';

// Unified activity item for timeline display
export interface GroupActivityItem {
  id: string;
  type: 'event' | 'update';
  title: string;
  created_at: string;
  user_id: string;
  
  // User profile data
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
  
  // Event-specific data
  event?: {
    id: string;
    title: string;
    description?: string;
    time: string;
    location: string;
    host_id: string;
    group_id?: string;
    neighborhood_id: string;
  };
  
  // Update-specific data  
  update?: GroupUpdate;
}

// Timeline view configuration
export interface GroupTimelineConfig {
  showCreateButton: boolean;
  allowEventCreation: boolean;
  allowUpdateCreation: boolean;
}

// Create forms data
export interface CreateUpdateFormData {
  title: string;
  content: string;
  image_urls?: string[];
}

export interface CreateEventFormData {
  title: string;
  description?: string;
  time: string;
  location: string;
}