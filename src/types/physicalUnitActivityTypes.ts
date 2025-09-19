/**
 * Physical Unit Activity Types
 * 
 * Core types for the physical unit activity timeline that combines resident activities,
 * unit events, and general updates. Mirrors the social group activity system for 
 * universal interface consistency.
 */

// Unified activity item for physical unit timeline display
export interface PhysicalUnitActivityItem {
  id: string;
  type: 'unit_start' | 'resident_joined' | 'resident_left' | 'unit_event' | 'unit_update';
  title: string;
  created_at: string;
  user_id: string;
  
  // User profile data
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
  
  // Event-specific data (if type is 'unit_event')
  event?: {
    id: string;
    title: string;
    description?: string;
    time: string;
    location: string;
    host_id: string;
    neighborhood_id: string;
  };
  
  // Update-specific data (if type is 'unit_update')
  update?: {
    id: string;
    title: string;
    content: string;
    image_urls?: string[];
    user_id: string;
  };
  
  // Unit metadata
  unit?: {
    unit_name: string;
    unit_label: string;
    created_at: string;
  };
  
  // Resident-specific data
  resident?: {
    user_id: string;
    display_name?: string;
    avatar_url?: string;
    joined_at?: string;
    left_at?: string;
  };
}

// Timeline view configuration for physical units
export interface PhysicalUnitTimelineConfig {
  showCreateButton: boolean;
  allowEventCreation: boolean;
  allowUpdateCreation: boolean;
}

// Create forms data for physical unit activities
export interface CreateUnitUpdateFormData {
  title: string;
  content: string;
  image_urls?: string[];
}

export interface CreateUnitEventFormData {
  title: string;
  description?: string;
  time: string;
  location: string;
}