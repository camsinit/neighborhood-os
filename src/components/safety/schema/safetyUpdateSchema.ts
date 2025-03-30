
import { z } from 'zod';

/**
 * Form schema for safety updates
 * 
 * This schema defines the validation rules for safety update forms using Zod
 */
export const safetyUpdateSchema = z.object({
  // Title must be between 3-100 characters
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100),
  
  // Description is required and must be at least 10 characters
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  
  // Type is required and must be one of the predefined types
  type: z.string().min(1, { message: 'Update type is required' }),
});

// Export the form data type for type safety throughout the application
export type SafetyUpdateFormData = z.infer<typeof safetyUpdateSchema>;

/**
 * Available safety update types
 */
export const safetyUpdateTypes = [
  { value: 'alerts', label: 'Alerts' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'updates', label: 'Updates' },
];

/**
 * Props interface for the safety update form
 */
export interface SafetyUpdateFormProps {
  onClose: () => void;
  initialValues?: {
    title: string;
    description: string;
    type: string;
  };
  mode?: 'create' | 'edit';
  updateId?: string;
}
