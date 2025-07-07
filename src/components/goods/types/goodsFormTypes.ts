/**
 * Types for goods form components and related functionality
 */

export interface GoodsFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  initialValues?: Partial<GoodsFormData>;
  initialData?: any; // For existing goods items from database (edit mode)
  mode?: 'create' | 'edit';
  requestId?: string;
  initialRequestType?: 'offer' | 'need';
}

export interface GoodsFormData {
  title: string;
  description: string;
  category: string;
  requestType: 'offer' | 'need';
  images: string[];
  availableDays?: number;
  urgency?: 'low' | 'medium' | 'high';
}

export interface ItemFormData {
  title: string;
  description: string;
  category: string;
  images: string[];
  availableDays?: number;
  requestType: 'offer';
}

export interface RequestFormData {
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  image?: string;
  category: string;
  requestType: 'need';
}

export type UrgencyLevel = 'low' | 'medium' | 'high';
export type RequestType = 'offer' | 'need';

export const GOODS_CATEGORIES = [
  "Furniture",
  "Electronics", 
  "Clothing",
  "Books",
  "Tools",
  "Kitchen Items",
  "Garden Supplies",
  "Sports Equipment",
  "Toys & Games",
  "Other"
] as const;

export type GoodsCategory = typeof GOODS_CATEGORIES[number];