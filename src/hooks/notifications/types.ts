
// Define BaseNotification interface with proper types
export interface BaseNotification {
  id: string;
  user_id: string;
  actor_id?: string;
  title: string;
  description?: string; // Added description field
  content_type: string;
  content_id: string;
  notification_type: string;
  action_type?: string;
  action_label?: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  context?: {
    [key: string]: any;
  };
  // Add profiles property for user data
  profiles?: {
    display_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  // Add relevance_score property
  relevance_score?: number;
}

// Make HighlightableItemType a type that accepts string literals or any string
// This allows us to use string values while still having type safety for common values
export type HighlightableItemType = "event" | "safety" | "skills" | "goods" | "support" | "neighbors" | string;

// Add ProfileData type to fix imports
export interface ProfileData {
  id: string;
  display_name?: string;
  avatar_url?: string;
}

// Add NotificationContext interface
export interface NotificationContext {
  notifications: BaseNotification[];
  refetch: () => void;
}

export type NotificationContextType = React.Context<NotificationContext>;
