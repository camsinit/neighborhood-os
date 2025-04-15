
// This file defines types used throughout the application

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
  urgency: "low" | "medium" | "high" | "critical";
  image?: string | null;
}

export type FormMode = "create" | "edit";

// Props for the goods form component
export interface GoodsFormProps {
  onClose: () => void;
  initialValues?: Partial<GoodsItemFormData | GoodsRequestFormData>;
  mode?: FormMode;
  requestId?: string;
  initialRequestType?: "need" | "offer" | null;
  forceDefaultDisplay?: boolean; // Added this prop to force consistent display
}

// Legacy support request form data
export interface SupportRequestFormData {
  title: string;
  description: string;
  category: string;
  requestType: "need" | "offer" | null;
  image?: string | null;
}

// Props for the legacy support request form component
export interface SupportRequestFormProps {
  onClose: () => void;
  initialValues?: Partial<SupportRequestFormData>;
  requestId?: string;
}
