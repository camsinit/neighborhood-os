
import { GoodsRequestUrgency } from '@/components/support/types/formTypes';

/**
 * Helper functions for working with urgency levels in freebies requests
 * 
 * These utilities provide consistent styling and labeling for the
 * various urgency levels throughout the application
 */

/**
 * Returns the CSS class for styling urgency badges based on urgency level
 * 
 * @param urgency - The urgency level of the request
 * @returns A string of CSS classes for the badge
 */
export const getUrgencyClass = (urgency: GoodsRequestUrgency) => {
  switch(urgency) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};

/**
 * Returns a user-friendly display label for urgency levels
 * 
 * @param urgency - The urgency level of the request
 * @returns A human-readable string label
 */
export const getUrgencyLabel = (urgency: GoodsRequestUrgency) => {
  switch(urgency) {
    case 'critical': return 'Critical';
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    default: return 'Medium';
  }
};
