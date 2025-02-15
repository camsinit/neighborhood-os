
import { z } from "zod";

export const profileFormSchema = z.object({
  display_name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string(),
  language: z.string(),
  theme: z.string(),
  notification_preferences: z.object({
    email: z.boolean(),
  }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export type NotificationPreferences = {
  email: boolean;
};
