export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      care_requests: {
        Row: {
          care_category: string
          created_at: string
          description: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          request_type: string
          support_type: string
          title: string
          user_id: string
          valid_until: string
        }
        Insert: {
          care_category: string
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          request_type: string
          support_type: string
          title: string
          user_id: string
          valid_until: string
        }
        Update: {
          care_category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          request_type?: string
          support_type?: string
          title?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          host_id: string
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          is_recurring: boolean | null
          location: string
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          time: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          host_id: string
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          is_recurring?: boolean | null
          location: string
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          time: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          host_id?: string
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          is_recurring?: boolean | null
          location?: string
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_exchange: {
        Row: {
          condition: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_archived: boolean | null
          is_read: boolean | null
          request_type: string
          title: string
          user_id: string
          valid_until: string
        }
        Insert: {
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          request_type: string
          title: string
          user_id: string
          valid_until: string
        }
        Update: {
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          request_type?: string
          title?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string
          action_type: Database["public"]["Enums"]["notification_action_type"]
          actor_id: string
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          metadata: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          title: string
          user_id: string
        }
        Insert: {
          action_label?: string
          action_type?: Database["public"]["Enums"]["notification_action_type"]
          actor_id: string
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          title: string
          user_id: string
        }
        Update: {
          action_label?: string
          action_type?: Database["public"]["Enums"]["notification_action_type"]
          actor_id?: string
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          language: string | null
          notification_preferences: Json | null
          phone_number: string | null
          skills: string[] | null
          theme: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          language?: string | null
          notification_preferences?: Json | null
          phone_number?: string | null
          skills?: string[] | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string | null
          notification_preferences?: Json | null
          phone_number?: string | null
          skills?: string[] | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_update_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          safety_update_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          safety_update_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          safety_update_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_update_comments_safety_update_id_fkey"
            columns: ["safety_update_id"]
            isOneToOne: false
            referencedRelation: "safety_updates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_update_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_updates: {
        Row: {
          author_id: string
          created_at: string
          description: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          title: string
          type: string
        }
        Insert: {
          author_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          title: string
          type: string
        }
        Update: {
          author_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills_exchange: {
        Row: {
          availability: string | null
          created_at: string
          description: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          request_type: string
          skill_category: string
          time_preferences: string[] | null
          title: string
          user_id: string
          valid_until: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          request_type: string
          skill_category: string
          time_preferences?: string[] | null
          title: string
          user_id: string
          valid_until: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          request_type?: string
          skill_category?: string
          time_preferences?: string[] | null
          title?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          care_category: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_archived: boolean | null
          is_read: boolean | null
          request_type: string
          skill_category: string | null
          support_type: string
          title: string
          user_id: string
          valid_until: string
        }
        Insert: {
          care_category?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          request_type: string
          skill_category?: string | null
          support_type: string
          title: string
          user_id: string
          valid_until: string
        }
        Update: {
          care_category?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          request_type?: string
          skill_category?: string | null
          support_type?: string
          title?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      auth_users_view: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_user_role: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      notification_action_type:
        | "rsvp"
        | "comment"
        | "help"
        | "respond"
        | "share"
        | "view"
      notification_type:
        | "event"
        | "safety"
        | "care"
        | "goods"
        | "skills"
        | "neighbor_welcome"
      user_role: "super_admin" | "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
