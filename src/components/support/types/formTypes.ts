
// This file defines types used throughout the application

import { z } from "zod";

/**
 * User profile information
 */
export interface Profile {
  id?: string;  // Make id optional to match what comes from the database
  display_name: string;
  avatar_url: string;
  created_at?: string;
  email?: string;  // Add email field to the Profile interface
}

// Categories of goods items that can be exchanged
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

// Types of requests/offers that can be made
export type RequestType = "need" | "offer";

// Urgency levels for requests
export type GoodsRequestUrgency = "low" | "medium" | "high" | "critical";

// Goods exchange form data for offers
export interface GoodsItemFormData {
  title: string;
  description: string;
  category: GoodsItemCategory;
  requestType: "offer";
  availableDays: number;
  images: string[];
}

// Goods exchange form data for requests
export interface GoodsRequestFormData {
  title: string;
  description: string;
  category: GoodsItemCategory;
  requestType: "need";
  urgency: GoodsRequestUrgency;
  image?: string | null;
}

export type FormMode = "create" | "edit";

// Props for the goods form component
export interface GoodsFormProps {
  onClose: () => void;
  initialValues?: Partial<GoodsItemFormData | GoodsRequestFormData>;
  mode?: FormMode;
  requestId?: string;
  initialRequestType?: RequestType | null;
  forceDefaultDisplay?: boolean; // Added this prop to force consistent display
}

// Support request form data
export interface SupportRequestFormData {
  title: string;
  description: string;
  category: string;
  requestType: RequestType;
  validUntil: string;
  supportType: "immediate" | "ongoing";
  imageUrl?: string;
  images?: string[];
  care_category?: string;
  goods_category?: string;
  urgency?: GoodsRequestUrgency;
  skill_category?: string;
  image?: string | null;
}

// Props for the support request form component
export interface SupportRequestFormProps {
  onClose: () => void;
  initialValues?: Partial<SupportRequestFormData>;
  requestId?: string;
  mode?: FormMode;
  initialRequestType?: RequestType | null;
}

// Zod schema for support request form validation
export const supportRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  requestType: z.enum(["need", "offer"]),
  validUntil: z.string().min(1, "Valid until date is required"),
  supportType: z.enum(["immediate", "ongoing"]),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  care_category: z.string().optional(),
  goods_category: z.string().optional(),
  urgency: z.enum(["low", "medium", "high", "critical"]).optional(),
  skill_category: z.string().optional(),
  image: z.string().nullable().optional(),
});
