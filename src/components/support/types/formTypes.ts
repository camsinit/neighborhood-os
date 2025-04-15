// This file defines the types for the support request forms
import { z } from 'zod';

// Define the schema for support requests
export const supportRequestSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  category: z.string(),
  requestType: z.enum(["need", "offer"]),
  validUntil: z.string().min(1, { message: 'Valid until date is required' }),
  supportType: z.enum(["immediate", "ongoing"]),
  imageUrl: z.string().optional().nullable(),
  // Add support for multiple images
  images: z.array(z.string()).optional(),
  // Add support for goods-specific fields
  goods_category: z.string().optional(),
  urgency: z.string().optional(),
  care_category: z.string().optional(),
  skill_category: z.string().optional(),
});

// Export the form data type
export type SupportRequestFormData = z.infer<typeof supportRequestSchema>;

export type SupportRequestFormProps = {
  onClose: () => void;
  initialValues?: Partial<SupportRequestFormData>;
  mode?: 'create' | 'edit';
  requestId?: string;
  initialRequestType?: "need" | "offer" | null;
};

// New types for goods-specific forms
export type GoodsItemCategory = 
  | "furniture" 
  | "tools" 
  | "electronics" 
  | "kitchen" 
  | "clothing" 
  | "books" 
  | "toys" 
  | "sports" 
  | "garden" 
  | "produce"
  | "household"
  | "other";

export type GoodsRequestUrgency = 
  | "low" 
  | "medium" 
  | "high" 
  | "critical";

export type GoodsItemFormData = {
  title: string;
  description: string;
  category: GoodsItemCategory;
  requestType: "need" | "offer";
  availableDays: number;
  images: string[];
};

export type GoodsRequestFormData = {
  title: string;
  description: string;
  urgency: GoodsRequestUrgency;
  category?: GoodsItemCategory;
  image?: string | null;
};

export type GoodsFormProps = {
  onClose: () => void;
  initialValues?: Partial<GoodsItemFormData | GoodsRequestFormData>;
  mode?: 'create' | 'edit';
  requestId?: string;
  initialRequestType?: "need" | "offer" | "request";
};
