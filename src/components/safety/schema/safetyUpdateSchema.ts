
import { z } from "zod";

// Update the schema to reflect new types
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

// Update safety update types for dropdown
export const SAFETY_UPDATE_TYPES = [
  { value: "Alert", label: "Alert" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Observation", label: "Observation" }
];
