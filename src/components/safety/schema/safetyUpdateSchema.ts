
import { z } from "zod";

export const safetyUpdateSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  type: z.enum(["Alert", "Maintenance", "Observation"], {
    required_error: "Please select a type.",
  }),
  imageUrl: z.string().optional(),
});

export type SafetyUpdateFormData = z.infer<typeof safetyUpdateSchema>;

// Simplified to just the three required types
export const SAFETY_UPDATE_TYPES = [
  { value: "Alert", label: "Alert" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Observation", label: "Observation" }
];
