
import { z } from 'zod';

/**
 * Form schema for care requests
 * 
 * This schema defines the validation rules for care request forms using Zod
 */
export const careRequestSchema = z.object({
  // Title must be between 3-100 characters
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100),
  
  // Description is optional
  description: z.string().optional(),
  
  // Request type must be either 'need' or 'offer'
  requestType: z.enum(['need', 'offer']),
  
  // Care category is required
  careCategory: z.string(),
  
  // Valid until date must be in the future
  validUntil: z.date().min(new Date(), { message: 'Date must be in the future' }),
});

// Export the form data type for type safety throughout the application
export type CareRequestFormData = z.infer<typeof careRequestSchema>;

/**
 * Available care categories
 * 
 * These are the predefined categories for care requests
 */
export const careCategories = [
  { value: 'meal_prep', label: 'Meal Prep' },
  { value: 'grocery_shopping', label: 'Grocery Shopping' },
  { value: 'childcare', label: 'Childcare' },
  { value: 'pet_care', label: 'Pet Care' },
  { value: 'house_tasks', label: 'House Tasks' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'emotional_support', label: 'Emotional Support' },
  { value: 'other', label: 'Other' },
];

/**
 * Props interface for the care request form
 */
export interface CareRequestFormProps {
  onClose: () => void;
  initialValues?: {
    requestType?: 'need' | 'offer' | null;
    careCategory?: string;
  };
  editMode?: boolean;
  existingRequest?: any;
}
