
/**
 * Activity-related type definitions
 * Updated to include neighbor_joined activity type
 */

// Define the activity types that can appear in the activity feed
export type ActivityType = 
  | 'event_created'
  | 'event_rsvp'
  | 'safety_update'
  | 'good_shared'      // For goods offers/freebies
  | 'good_requested'   // For goods requests
  | 'skill_offered'
  | 'skill_requested'
  | 'care_offered'
  | 'care_requested'
  | 'neighbor_joined'  // NEW: For when neighbors join
  | 'profile_updated'  // For profile updates
  | 'group_created';   // NEW: For when groups are created

// Define valid content table names for type safety
export type ContentTable = 'events' | 'safety_updates' | 'skills_exchange' | 'goods_exchange';

// Activity metadata can vary by activity type
export interface ActivityMetadata {
  // Common fields
  deleted?: boolean;
  original_title?: string;
  
  // Event-specific metadata
  description?: string;
  
  // Neighbor-specific metadata
  neighborName?: string;
  action?: string;
  updatedFields?: string[];
  
  // Skill-specific metadata
  category?: string;
  request_type?: string;
  
  // Safety-specific metadata
  type?: string;
  safetyType?: string;
  
  // Goods-specific metadata
  goods_category?: string;
  urgency?: string;
  
  // Template-related metadata (for notifications)
  templateId?: string;
  variables?: Record<string, any>;
  
  // Additional context
  [key: string]: any;
}

// Main activity interface
export interface Activity {
  id: string;
  actor_id: string;
  activity_type: ActivityType;
  content_id: string;
  content_type: string;
  title: string;
  created_at: string;
  neighborhood_id: string | null;
  metadata: ActivityMetadata | null;
  is_public: boolean | null;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  };
}
