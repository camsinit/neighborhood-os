
/**
 * This file contains type definitions for activities
 */

// Define activity types for better type safety
export type ActivityType = 
  | 'event_created' 
  | 'event_rsvp' 
  | 'skill_offered' 
  | 'skill_requested' 
  | 'good_shared' 
  | 'good_requested' 
  | 'safety_update';

// Define valid content tables for type safety
export type ContentTable = 'events' | 'safety_updates' | 'skills_exchange' | 'goods_exchange';

// Define the shape of metadata to ensure type safety
export interface ActivityMetadata {
  deleted?: boolean;
  original_title?: string;
  [key: string]: any;
}

// Main Activity interface
export interface Activity {
  id: string;
  actor_id: string;
  activity_type: ActivityType;
  content_id: string;
  content_type: string;
  title: string;
  created_at: string;
  metadata?: ActivityMetadata;
  profiles: {
    display_name: string;
    avatar_url: string;
  };
}
