/**
 * Types for Group Updates functionality
 */

export interface GroupUpdate {
  id: string;
  group_id: string;
  user_id: string;
  title: string; // NEW: Title field (max 25 chars)
  content: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  edited_by?: string;
  is_deleted: boolean;
  
  // Additional data from joins
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface GroupUpdateComment {
  id: string;
  update_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  edited_by?: string;
  is_deleted: boolean;
  
  // Additional data from joins
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface GroupUpdateReaction {
  id: string;
  update_id?: string;
  comment_id?: string;
  user_id: string;
  emoji: string;
  created_at: string;
  
  // Additional data from joins
  profiles?: {
    display_name?: string;
  };
}

export interface CreateGroupUpdateData {
  group_id: string;
  title: string; // NEW: Required title field
  content: string;
  image_urls?: string[];
}

export interface CreateGroupUpdateCommentData {
  update_id: string;
  content: string;
}

export interface CreateGroupUpdateReactionData {
  update_id?: string;
  comment_id?: string;
  emoji: string;
}

export interface GroupUpdateWithComments extends GroupUpdate {
  comments: GroupUpdateComment[];
  reactions: GroupUpdateReaction[];
  commentCount: number;
  reactionSummary: { [emoji: string]: number };
}

export interface GroupUpdateFeedViewType {
  activeView: 'updates' | 'events';
}