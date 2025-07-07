import {
  GoodsCategory,
  UrgencyLevel
} from "../types/goodsFormTypes";

/**
 * Common goods suggestions by category
 * 
 * These suggestions are displayed as quick buttons to help users
 * quickly fill in common items in each category.
 */
export const GOODS_SUGGESTIONS: Record<GoodsCategory, string[]> = {
  "Furniture": ["Couch", "Chair", "Table", "Desk", "Bookshelf"],
  "Electronics": ["TV", "Laptop", "Phone", "Camera", "Speakers"],
  "Clothing": ["Winter Clothes", "Jackets", "Shoes", "Children's Clothes"],
  "Books": ["Fiction", "Non-fiction", "Textbooks", "Children's Books"],
  "Tools": ["Hammer", "Drill", "Saw", "Ladder", "Lawnmower"],
  "Kitchen Items": ["Blender", "Toaster", "Pots & Pans", "Dishes", "Utensils"],
  "Garden Supplies": ["Plants", "Seeds", "Garden Tools", "Flower Pots"],
  "Sports Equipment": ["Bicycle", "Tennis Racket", "Basketball", "Camping Gear"],
  "Toys & Games": ["Board Games", "Puzzles", "Children's Toys", "Outdoor Play Equipment"],
  "Other": ["Art Supplies", "Craft Materials", "Musical Instruments"]
};

/**
 * Friendly display names for goods categories
 * 
 * These are used in dropdowns and UI elements to show user-friendly
 * category names.
 */
export const CATEGORY_NAMES: Record<GoodsCategory, string> = {
  "Furniture": "Furniture",
  "Electronics": "Electronics",
  "Clothing": "Clothing",
  "Books": "Books & Media",
  "Tools": "Tools & Equipment",
  "Kitchen Items": "Kitchen Items",
  "Garden Supplies": "Garden & Plants",
  "Sports Equipment": "Sports & Recreation",
  "Toys & Games": "Toys & Games",
  "Other": "Other Items"
};

/**
 * Friendly display names for urgency levels
 * 
 * These are used in dropdowns and UI elements to show user-friendly
 * urgency level descriptions.
 */
export const URGENCY_NAMES: Record<UrgencyLevel, string> = {
  low: "Low - When convenient",
  medium: "Medium - Within a week",
  high: "High - Within a few days"
};
