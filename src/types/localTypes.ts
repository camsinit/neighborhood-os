
export interface Profile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface SafetyUpdate {
  id: string;
  title: string;
  description: string;
  type: string;
  author_id: string;
  created_at: string;
  profiles?: Profile;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  time: string;
  location: string;
  host_id: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  recurrence_end_date?: string;
  created_at: string;
  profiles?: Profile;
}

export interface SupportRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  request_type: string;
  support_type: string;
  user_id: string;
  valid_until: string;
  image_url?: string;
  created_at: string;
  is_archived?: boolean;
  is_read?: boolean;
  profiles?: Profile;
}
