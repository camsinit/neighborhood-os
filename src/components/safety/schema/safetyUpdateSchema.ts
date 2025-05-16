
import { z } from "zod";

export const safetyUpdateSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  // Updated to use a more specific set of update categories
  type: z.enum(["Emergency", "Alert", "Infrastructure", "Maintenance", "General"], {
    required_error: "Please select a type.",
  }),
  imageUrl: z.string().optional(),
});

export type SafetyUpdateFormData = z.infer<typeof safetyUpdateSchema>;

// Updated with new community update specific categories
export const SAFETY_UPDATE_TYPES = [
  { value: "Emergency", label: "Emergency" },          // For urgent situations requiring immediate attention
  { value: "Alert", label: "Alert" },                  // For important warnings that aren't emergencies
  { value: "Infrastructure", label: "Infrastructure" }, // For issues with roads, lighting, etc.
  { value: "Maintenance", label: "Maintenance" },       // For ongoing or scheduled maintenance
  { value: "General", label: "General" }               // For other community-related updates
];
