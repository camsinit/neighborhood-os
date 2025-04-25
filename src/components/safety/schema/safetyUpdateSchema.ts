
import { z } from "zod";

export const safetyUpdateSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  // Updated to use a more specific set of safety-related categories
  type: z.enum(["Emergency", "Suspicious Activity", "Infrastructure", "Weather Alert", "General Safety"], {
    required_error: "Please select a type.",
  }),
  imageUrl: z.string().optional(),
});

export type SafetyUpdateFormData = z.infer<typeof safetyUpdateSchema>;

// Updated with new safety-specific categories
export const SAFETY_UPDATE_TYPES = [
  { value: "Emergency", label: "Emergency" },          // For urgent situations requiring immediate attention
  { value: "Suspicious Activity", label: "Suspicious Activity" },  // For reporting unusual or concerning behavior
  { value: "Infrastructure", label: "Infrastructure" }, // For issues with roads, lighting, etc.
  { value: "Weather Alert", label: "Weather Alert" },   // For severe weather warnings
  { value: "General Safety", label: "General Safety" }  // For other safety-related updates
];

