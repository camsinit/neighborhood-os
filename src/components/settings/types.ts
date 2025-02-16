
import { z } from "zod";

export const profileFormSchema = z.object({
  display_name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string(),
  language: z.string(),
  theme: z.string(),
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
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export type NotificationPreferences = {
  involved_only: boolean;
  page_specific: {
    events: boolean;
    safety: boolean;
    care: boolean;
    goods: boolean;
    skills: boolean;
    neighbors: boolean;
  };
  all_activity: boolean;
  new_neighbors: boolean;
};
