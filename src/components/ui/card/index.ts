
/**
 * Card component exports
 * 
 * This file exports all card components, both from shadcn/ui and our custom implementations
 */

// Re-export the shadcn/ui Card components
export * from "@/components/ui/card";

// Export our custom card components
export { default as BaseCard, type BaseCardProps } from "./BaseCard";
// Export the ModuleItemCard component correctly
export { default as ModuleItemCard, type ModuleItemCardProps } from "./ModuleItemCard";
