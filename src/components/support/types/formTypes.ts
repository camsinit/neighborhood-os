
// This file defines the types for the support request forms

export type SupportRequestFormData = {
  title: string;
  description: string;
  category: string;
  requestType: "need" | "offer";
  validUntil: string;
  supportType: "immediate" | "ongoing";
  imageUrl?: string | null;
  skill_category?: string;
  care_category?: string;
};

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
  initialRequestType: "need" | "offer";
};
