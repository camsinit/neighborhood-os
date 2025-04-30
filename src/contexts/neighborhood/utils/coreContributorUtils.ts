
/**
 * Core contributor utilities (DISABLED)
 * 
 * These functions have been disabled as part of simplifying the neighborhood access model.
 * They now return default values to maintain compatibility with existing code.
 */

/**
 * Check if a user is a core contributor (DISABLED)
 * This function now always returns false - core contributor functionality is disabled.
 * 
 * @param userId - The ID of the user
 * @returns Always returns false
 */
export const checkCoreContributorAccess = async (userId: string): Promise<boolean> => {
  console.log("[coreContributorUtils] Core contributor functionality is disabled");
  return false;
};

/**
 * Fetch all neighborhoods for core contributors (DISABLED)
 * This function now always returns an empty array - core contributor functionality is disabled.
 * 
 * @param userId - The ID of the user
 * @returns Empty array
 */
export const fetchAllNeighborhoodsForCoreContributor = async (userId: string): Promise<any[]> => {
  console.log("[coreContributorUtils] Core contributor functionality is disabled");
  return [];
};
