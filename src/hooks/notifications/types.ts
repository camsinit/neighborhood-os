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
}

export type HighlightableItemType = "event" | "safety" | "skills" | "goods" | "support";
