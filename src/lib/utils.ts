
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * 
 * This combines multiple class names and handles conditional classes
 * while properly merging Tailwind utilities
 * 
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
