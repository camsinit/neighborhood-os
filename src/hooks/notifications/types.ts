
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
    contextType: string;
    [key: string]: any;
  };
  relevance_score?: number; // Add relevance_score property
  type?: string; // Add type property for compatibility with existing code
}

export type HighlightableItemType = "event" | "safety" | "skills" | "goods" | "support";

// Add ProfileData type to fix imports
export interface ProfileData {
  id: string;
  display_name?: string;
  avatar_url?: string;
}

// Add NotificationContext and NotificationContextType for compatibility
export interface NotificationContext {
  notifications: BaseNotification[];
  refetch: () => void;
}

export type NotificationContextType = React.Context<NotificationContext>;
