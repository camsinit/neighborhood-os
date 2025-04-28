/**
 * Helper functions for freebies sections components
 * 
 * This file contains utility functions that are shared across multiple
 * freebies section components for consistent formatting and presentation.
 */

/**
 * Function to get the appropriate CSS class for urgency labels
 * @param urgency The urgency level as a string
 * @returns CSS class string for styling the urgency badge
 */
export const getUrgencyClass = (urgency: string) => {
  // Map different urgency levels to appropriate color classes
  switch(urgency?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Function to get a human-readable label for urgency levels
 * @param urgency The urgency level as a string
 * @returns User-friendly label for the urgency level
 */
export const getUrgencyLabel = (urgency: string) => {
  // Convert technical urgency levels to user-friendly text
  switch(urgency?.toLowerCase()) {
    case 'high':
      return 'Urgent';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return 'Standard';
  }
};

/**
 * Helper function to filter freebies items based on search query
 * @param items Array of freebies items to filter
 * @param searchQuery String to search for
 * @returns Filtered array of freebies items
 */
export const filterBySearch = (items: any[], searchQuery: string) => {
  // If no search query, return all items
  if (!searchQuery) return items;
  
  // Otherwise, filter by title, description, or category
  const query = searchQuery.toLowerCase();
  return items.filter(item => 
    (item.title?.toLowerCase().includes(query) || 
    item.description?.toLowerCase().includes(query) ||
    item.goods_category?.toLowerCase().includes(query))
  );
};
