// Constants used throughout the goods exchange feature

import { 
  GoodsItemCategory,
  GoodsRequestUrgency
} from "@/components/support/types/formTypes";

/**
 * Common goods suggestions by category
 * 
 * These suggestions are displayed as quick buttons to help users
 * quickly fill in common items in each category.
 */
export const GOODS_SUGGESTIONS: Record<GoodsItemCategory, string[]> = {
  furniture: ["Couch", "Chair", "Table", "Desk", "Bookshelf"],
  tools: ["Hammer", "Drill", "Saw", "Ladder", "Lawnmower"],
  electronics: ["TV", "Laptop", "Phone", "Camera", "Speakers"],
  kitchen: ["Blender", "Toaster", "Pots & Pans", "Dishes", "Utensils"],
  clothing: ["Winter Clothes", "Jackets", "Shoes", "Children's Clothes"],
  books: ["Fiction", "Non-fiction", "Textbooks", "Children's Books"],
  toys: ["Board Games", "Puzzles", "Children's Toys", "Outdoor Play Equipment"],
  sports: ["Bicycle", "Tennis Racket", "Basketball", "Camping Gear"],
  garden: ["Plants", "Seeds", "Garden Tools", "Flower Pots"],
  produce: ["Fruits", "Vegetables", "Herbs", "Homegrown Produce"],
  household: ["Cleaning Supplies", "Home Decor", "Bedding", "Storage Containers"],
  other: ["Art Supplies", "Craft Materials", "Musical Instruments"]
};

/**
 * Friendly display names for goods categories
 * 
 * These are used in dropdowns and UI elements to show user-friendly
 * category names.
 */
export const CATEGORY_NAMES: Record<GoodsItemCategory, string> = {
  furniture: "Furniture",
  tools: "Tools & Equipment",
  electronics: "Electronics",
  kitchen: "Kitchen Items",
  clothing: "Clothing",
  books: "Books & Media",
  toys: "Toys & Games",
  sports: "Sports & Recreation",
  garden: "Garden & Plants",
  produce: "Fresh Produce",
  household: "Household Items",
  other: "Other Items"
};

/**
 * Friendly display names for urgency levels
 * 
 * These are used in dropdowns and UI elements to show user-friendly
 * urgency level descriptions.
 */
export const URGENCY_NAMES: Record<GoodsRequestUrgency, string> = {
  low: "Low - When convenient",
  medium: "Medium - Within a week",
  high: "High - Within a few days",
  critical: "Critical - Needed immediately"
};
