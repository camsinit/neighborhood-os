
import { z } from "zod";

export const safetyUpdateSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  // Updated to use neighborhood update categories
  type: z.enum(["Housing/Rentals", "Suspicious Activity", "Ideas & Inspiration"], {
    required_error: "Please select a type.",
  }),
  imageUrl: z.string().optional(),
});

export type SafetyUpdateFormData = z.infer<typeof safetyUpdateSchema>;

// Updated with new neighborhood update categories
export const SAFETY_UPDATE_TYPES = [
  { value: "Housing/Rentals", label: "Housing/Rentals" },
  { value: "Suspicious Activity", label: "Suspicious Activity" },
  { value: "Ideas & Inspiration", label: "Ideas & Inspiration" }
];

