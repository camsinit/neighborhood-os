
// Define BaseNotification interface with proper types
export interface BaseNotification {
  id: string;
  user_id: string;
  actor_id?: string;
  title: string;
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
    contextType?: string;
    neighborName?: string;
    avatarUrl?: string;
    [key: string]: any;
  };
  relevance_score?: number;
  notification_type_display?: string; // Optional display name
  // Profiles is not officially part of the type but might be present in some cases
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export type HighlightableItemType = "event" | "safety" | "skills" | "goods" | "support" | "neighbors";

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
