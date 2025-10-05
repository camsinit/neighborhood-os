
import { z } from "zod";

export const profileFormSchema = z.object({
  display_name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string(),
  language: z.string(),
  theme: z.string(),
  skills: z.array(z.string()).default([]),
  notification_preferences: z.object({
    involved_only: z.boolean(),
    page_specific: z.object({
      events: z.boolean(),
      safety: z.boolean(),
      care: z.boolean(),
      goods: z.boolean(),
      skills: z.boolean(),
      neighbors: z.boolean()
    }),
    all_activity: z.boolean(),
    new_neighbors: z.boolean()
  }),
  // Privacy settings
  email_visible: z.boolean().default(false),
  phone_visible: z.boolean().default(false),
  address_visible: z.boolean().default(false),
  needs_visible: z.boolean().default(false),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

// New granular notification preferences structure
export type NotificationPreferences = {
  email: {
    personal: {
      events: {
        event_rsvp: boolean;
        group_event_invitation: boolean;
      };
      groups: {
        group_member_joined: boolean;
        group_update_comment: boolean;
        group_invitation: boolean;
      };
    };
    neighborhood: {
      events: {
        event_created: boolean;
      };
      groups: {
        group_update_posted: boolean;
        group_event_created: boolean;
      };
      neighbors: {
        neighbor_joined: boolean;
      };
    };
    weekly_summary: boolean;
  };
};
