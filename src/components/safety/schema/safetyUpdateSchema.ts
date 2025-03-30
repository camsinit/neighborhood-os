
/**
 * Schema definition for safety update forms
 * 
 * This module defines the validation schema for safety updates using zod.
 * It centralizes validation logic for reuse across different components.
 */
import { z } from "zod";

// Define the form schema with zod validation
export const safetyUpdateSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  type: z.enum(["Alerts", "Maintenance", "General"], {
    required_error: "Please select a type of update.",
  }),
});

// Define the type for form values based on the schema
export type SafetyUpdateFormData = z.infer<typeof safetyUpdateSchema>;

// Safety update types for dropdown
export const SAFETY_UPDATE_TYPES = [
  { value: "Alerts", label: "Alert" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "General", label: "General Information" }
];
