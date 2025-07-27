export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          actor_id: string
          content_id: string
          content_type: string
          created_at: string
          id: string
          is_public: boolean | null
          metadata: Json | null
          neighborhood_id: string | null
          title: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          actor_id: string
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          neighborhood_id?: string | null
          title: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          actor_id?: string
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          neighborhood_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          max_retries: number
          neighborhood_id: string | null
          recipient_email: string
          resend_email_id: string | null
          retry_count: number
          scheduled_for: string
          sent_at: string | null
          status: string
          template_data: Json
          template_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number
          neighborhood_id?: string | null
          recipient_email: string
          resend_email_id?: string | null
          retry_count?: number
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          template_data?: Json
          template_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number
          neighborhood_id?: string | null
          recipient_email?: string
          resend_email_id?: string | null
          retry_count?: number
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          template_data?: Json
          template_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          neighborhood_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          neighborhood_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          neighborhood_id?: string | null
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
            foreignKeyName: "event_rsvps_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
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
          event_id: string | null
          host_id: string
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          is_recurring: boolean | null
          location: string
          neighborhood_id: string
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          time: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id?: string | null
          host_id: string
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          is_recurring?: boolean | null
          location: string
          neighborhood_id: string
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          time: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string | null
          host_id?: string
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          is_recurring?: boolean | null
          location?: string
          neighborhood_id?: string
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
          {
            foreignKeyName: "events_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_exchange: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          category: string
          condition: string | null
          created_at: string
          description: string | null
          goods_category: string | null
          goods_item_id: string | null
          id: string
          image_url: string | null
          images: string[] | null
          is_archived: boolean | null
          is_read: boolean | null
          neighborhood_id: string
          request_type: string
          title: string
          urgency: string | null
          user_id: string
          valid_until: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          category?: string
          condition?: string | null
          created_at?: string
          description?: string | null
          goods_category?: string | null
          goods_item_id?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_archived?: boolean | null
          is_read?: boolean | null
          neighborhood_id: string
          request_type: string
          title: string
          urgency?: string | null
          user_id: string
          valid_until: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          category?: string
          condition?: string | null
          created_at?: string
          description?: string | null
          goods_category?: string | null
          goods_item_id?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_archived?: boolean | null
          is_read?: boolean | null
          neighborhood_id?: string
          request_type?: string
          title?: string
          urgency?: string | null
          user_id?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_exchange_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_exchange_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_id: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          invite_code: string
          inviter_id: string
          neighborhood_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_id?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          invite_code: string
          inviter_id: string
          neighborhood_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_id?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          invite_code?: string
          inviter_id?: string
          neighborhood_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhood_members: {
        Row: {
          id: string
          joined_at: string
          neighborhood_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          neighborhood_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          neighborhood_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighborhood_members_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhood_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          neighborhood_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          neighborhood_id: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          neighborhood_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighborhood_roles_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhoods: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string
          geo_boundary: Json | null
          id: string
          invite_header_image_url: string | null
          name: string
          state: string | null
          timezone: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by: string
          geo_boundary?: Json | null
          id?: string
          invite_header_image_url?: string | null
          name: string
          state?: string | null
          timezone?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string
          geo_boundary?: Json | null
          id?: string
          invite_header_image_url?: string | null
          name?: string
          state?: string | null
          timezone?: string
          zip?: string | null
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
          relevance_score: number | null
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
          relevance_score?: number | null
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
          relevance_score?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_needs: string | null
          address: string | null
          address_visible: boolean | null
          avatar_url: string | null
          bio: string | null
          completed_onboarding: boolean | null
          completed_skills_onboarding: boolean | null
          created_at: string
          display_name: string | null
          email_visible: boolean | null
          id: string
          language: string | null
          needs_visible: boolean | null
          notification_preferences: Json | null
          phone_number: string | null
          phone_visible: boolean | null
          skills: string[] | null
          theme: string | null
          timezone: string | null
          updated_at: string
          years_lived_here: number | null
        }
        Insert: {
          access_needs?: string | null
          address?: string | null
          address_visible?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          completed_onboarding?: boolean | null
          completed_skills_onboarding?: boolean | null
          created_at?: string
          display_name?: string | null
          email_visible?: boolean | null
          id: string
          language?: string | null
          needs_visible?: boolean | null
          notification_preferences?: Json | null
          phone_number?: string | null
          phone_visible?: boolean | null
          skills?: string[] | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          years_lived_here?: number | null
        }
        Update: {
          access_needs?: string | null
          address?: string | null
          address_visible?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          completed_onboarding?: boolean | null
          completed_skills_onboarding?: boolean | null
          created_at?: string
          display_name?: string | null
          email_visible?: boolean | null
          id?: string
          language?: string | null
          needs_visible?: boolean | null
          notification_preferences?: Json | null
          phone_number?: string | null
          phone_visible?: boolean | null
          skills?: string[] | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          years_lived_here?: number | null
        }
        Relationships: []
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
          image_url: string | null
          is_archived: boolean | null
          is_read: boolean | null
          neighborhood_id: string
          safety_update_id: string | null
          title: string
          type: string
        }
        Insert: {
          author_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          neighborhood_id: string
          safety_update_id?: string | null
          title: string
          type: string
        }
        Update: {
          author_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          neighborhood_id?: string
          safety_update_id?: string | null
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
          {
            foreignKeyName: "safety_updates_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shared_items: {
        Row: {
          content_id: string
          content_type: Database["public"]["Enums"]["shareable_content_type"]
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          neighborhood_id: string
          share_code: string
          shared_by: string
          view_count: number
        }
        Insert: {
          content_id: string
          content_type: Database["public"]["Enums"]["shareable_content_type"]
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          neighborhood_id: string
          share_code: string
          shared_by: string
          view_count?: number
        }
        Update: {
          content_id?: string
          content_type?: Database["public"]["Enums"]["shareable_content_type"]
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          neighborhood_id?: string
          share_code?: string
          shared_by?: string
          view_count?: number
        }
        Relationships: []
      }
      skill_contributors: {
        Row: {
          availability: string | null
          created_at: string
          id: string
          is_active: boolean | null
          skill_id: string
          time_preferences: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          skill_id: string
          time_preferences?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          skill_id?: string
          time_preferences?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_contributors_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills_exchange"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_contributors_user_id_fkey"
            columns: ["user_id"]
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
          neighborhood_id: string
          request_type: string
          skill_category: string
          skill_id: string | null
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
          neighborhood_id: string
          request_type: string
          skill_category: string
          skill_id?: string | null
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
          neighborhood_id?: string
          request_type?: string
          skill_category?: string
          skill_id?: string | null
          time_preferences?: string[] | null
          title?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_exchange_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skills_exchange_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      waitlist_survey_responses: {
        Row: {
          ai_coding_experience: string
          city: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          neighborhood_name: string
          neighbors_to_onboard: number
          open_source_interest: string
          priority_score: number | null
          state: string
          updated_at: string
        }
        Insert: {
          ai_coding_experience: string
          city: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          neighborhood_name: string
          neighbors_to_onboard?: number
          open_source_interest: string
          priority_score?: number | null
          state: string
          updated_at?: string
        }
        Update: {
          ai_coding_experience?: string
          city?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          neighborhood_name?: string
          neighbors_to_onboard?: number
          open_source_interest?: string
          priority_score?: number | null
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_waitlist_email"
            columns: ["email"]
            isOneToOne: false
            referencedRelation: "waitlist"
            referencedColumns: ["email"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_admin_invitation: {
        Args: { invitation_code: string }
        Returns: Json
      }
      add_initial_super_admin: {
        Args: { admin_email: string }
        Returns: undefined
      }
      add_neighborhood_member: {
        Args: { user_uuid: string; neighborhood_uuid: string }
        Returns: boolean
      }
      assign_user_role: {
        Args: {
          target_user_id: string
          target_role: Database["public"]["Enums"]["user_role"]
          assigned_by_user_id?: string
        }
        Returns: boolean
      }
      backfill_neighborhood_ids: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_priority_score: {
        Args: {
          neighbors_count: number
          ai_experience: string
          open_source: string
        }
        Returns: number
      }
      check_neighborhood_access: {
        Args: { neighborhood_id: string }
        Returns: boolean
      }
      check_neighborhood_limit: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      check_user_neighborhood_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      check_user_role: {
        Args: {
          user_uuid: string
          role_name: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      create_admin_invitation: {
        Args: {
          target_email: string
          target_neighborhood_id: string
          invitation_message?: string
        }
        Returns: string
      }
      create_neighborhood_as_super_admin: {
        Args: {
          neighborhood_name: string
          neighborhood_city?: string
          neighborhood_state?: string
          neighborhood_address?: string
          neighborhood_timezone?: string
        }
        Returns: string
      }
      create_neighborhood_as_super_admin_with_options: {
        Args:
          | {
              neighborhood_name: string
              neighborhood_city?: string
              neighborhood_state?: string
              neighborhood_address?: string
              neighborhood_timezone?: string
            }
          | {
              neighborhood_name: string
              neighborhood_city?: string
              neighborhood_state?: string
              neighborhood_address?: string
              neighborhood_timezone?: string
              join_as_member?: boolean
            }
        Returns: string
      }
      create_unified_system_notification: {
        Args: {
          p_user_id: string
          p_actor_id: string
          p_title: string
          p_content_type: string
          p_content_id: string
          p_notification_type: Database["public"]["Enums"]["notification_type"]
          p_action_type?: Database["public"]["Enums"]["notification_action_type"]
          p_action_label?: string
          p_relevance_score?: number
          p_metadata?: Json
        }
        Returns: string
      }
      delete_activity_debug: {
        Args: { activity_id: string }
        Returns: boolean
      }
      delete_user_account: {
        Args: { target_user_id: string }
        Returns: Json
      }
      generate_share_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_activities_safe: {
        Args: { user_uuid: string; limit_count?: number }
        Returns: {
          id: string
          actor_id: string
          activity_type: string
          content_id: string
          content_type: string
          title: string
          created_at: string
          metadata: Json
          neighborhood_id: string
        }[]
      }
      get_all_neighborhoods_for_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          city: string
          state: string
          created_at: string
          created_by: string
          member_count: number
        }[]
      }
      get_all_neighborhoods_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string
          geo_boundary: Json | null
          id: string
          invite_header_image_url: string | null
          name: string
          state: string | null
          timezone: string
          zip: string | null
        }[]
      }
      get_all_user_neighborhoods: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          name: string
          joined_at: string
          is_creator: boolean
        }[]
      }
      get_neighborhood_from_invite: {
        Args: { invite_code_param: string }
        Returns: {
          neighborhood_id: string
          neighborhood_name: string
          neighborhood_city: string
          neighborhood_state: string
          neighborhood_created_at: string
          member_count: number
          invitation_status: string
          inviter_id: string
          inviter_display_name: string
          inviter_avatar_url: string
          invite_header_image_url: string
        }[]
      }
      get_neighborhood_members: {
        Args: { neighborhood_uuid: string }
        Returns: string[]
      }
      get_neighborhood_members_direct: {
        Args: { neighborhood_uuid: string }
        Returns: string[]
      }
      get_neighborhood_members_safe: {
        Args: { neighborhood_uuid: string }
        Returns: string[]
      }
      get_neighborhood_members_simple: {
        Args: { neighborhood_uuid: string }
        Returns: string[]
      }
      get_neighborhood_members_with_profiles: {
        Args: { neighborhood_uuid: string }
        Returns: {
          user_id: string
          display_name: string
          email: string
          avatar_url: string
          email_visible: boolean
          phone_visible: boolean
          address_visible: boolean
          needs_visible: boolean
        }[]
      }
      get_neighborhood_user_emails: {
        Args: { target_neighborhood_id: string }
        Returns: {
          user_id: string
          email: string
        }[]
      }
      get_user_current_neighborhood: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_neighborhood_ids: {
        Args: { user_uuid: string }
        Returns: string[]
      }
      get_user_neighborhood_memberships: {
        Args: { user_uuid: string }
        Returns: {
          neighborhood_id: string
          user_id: string
          status: string
          joined_at: string
        }[]
      }
      get_user_neighborhood_role: {
        Args: { user_uuid: string; neighborhood_uuid: string }
        Returns: string
      }
      get_user_neighborhoods: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          name: string
          joined_at: string
        }[]
      }
      is_actual_member: {
        Args: { user_uuid: string; neighborhood_uuid: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_user_in_neighborhood: {
        Args: { user_uuid: string; neighborhood_uuid: string }
        Returns: boolean
      }
      join_neighborhood_as_super_admin: {
        Args: { neighborhood_uuid: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_action_type: string
          p_target_user_id?: string
          p_details?: Json
        }
        Returns: undefined
      }
      remove_neighborhood_member: {
        Args: {
          creator_uuid: string
          member_uuid: string
          neighborhood_uuid: string
        }
        Returns: boolean
      }
      remove_user_role: {
        Args: {
          target_user_id: string
          target_role: Database["public"]["Enums"]["user_role"]
          removed_by_user_id?: string
        }
        Returns: boolean
      }
      should_user_receive_email_notification: {
        Args: {
          p_user_id: string
          p_notification_type: string
          p_content_type: string
        }
        Returns: boolean
      }
      simple_membership_check: {
        Args: { user_uuid: string; neighborhood_uuid: string }
        Returns: boolean
      }
      transfer_neighborhood_ownership: {
        Args: {
          current_owner_uuid: string
          new_owner_uuid: string
          neighborhood_uuid: string
        }
        Returns: boolean
      }
      user_created_neighborhood: {
        Args: { user_uuid: string; neighborhood_uuid: string }
        Returns: boolean
      }
      user_is_neighborhood_member: {
        Args: { user_uuid: string; neighborhood_uuid: string }
        Returns: boolean
      }
      users_share_neighborhood: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      verify_user_deletion: {
        Args: { target_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      activity_type:
        | "event_created"
        | "event_rsvp"
        | "skill_offered"
        | "skill_requested"
        | "good_shared"
        | "good_requested"
        | "care_offered"
        | "care_requested"
        | "safety_update"
        | "neighbor_joined"
      invitation_status: "pending" | "accepted" | "expired" | "deleted"
      notification_action_type:
        | "rsvp"
        | "comment"
        | "help"
        | "respond"
        | "share"
        | "view"
        | "schedule"
        | "learn"
      notification_type:
        | "event"
        | "safety"
        | "care"
        | "goods"
        | "skills"
        | "neighbor_welcome"
      shareable_content_type: "events" | "safety" | "skills" | "goods"
      user_role:
        | "super_admin"
        | "admin"
        | "moderator"
        | "user"
        | "steward"
        | "neighbor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "event_created",
        "event_rsvp",
        "skill_offered",
        "skill_requested",
        "good_shared",
        "good_requested",
        "care_offered",
        "care_requested",
        "safety_update",
        "neighbor_joined",
      ],
      invitation_status: ["pending", "accepted", "expired", "deleted"],
      notification_action_type: [
        "rsvp",
        "comment",
        "help",
        "respond",
        "share",
        "view",
        "schedule",
        "learn",
      ],
      notification_type: [
        "event",
        "safety",
        "care",
        "goods",
        "skills",
        "neighbor_welcome",
      ],
      shareable_content_type: ["events", "safety", "skills", "goods"],
      user_role: [
        "super_admin",
        "admin",
        "moderator",
        "user",
        "steward",
        "neighbor",
      ],
    },
  },
} as const
