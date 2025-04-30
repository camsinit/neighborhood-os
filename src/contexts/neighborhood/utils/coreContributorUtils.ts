
/**
 * Core contributor utilities - REMOVED
 * 
 * This file now contains no functionality as we've streamlined the neighborhood access model.
 * It exists only for backward compatibility with existing imports.
 */

// Export empty functions to maintain API compatibility
export const checkCoreContributorAccess = async (): Promise<boolean> => {
  console.log("[coreContributorUtils] Core contributor functionality has been removed");
  return false;
};

export const fetchAllNeighborhoodsForCoreContributor = async (): Promise<any[]> => {
  console.log("[coreContributorUtils] Core contributor functionality has been removed");
  return [];
};
