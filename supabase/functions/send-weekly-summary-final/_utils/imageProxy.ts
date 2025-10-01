/**
 * Convert Supabase storage URLs to use the sending domain for better email deliverability
 * TEMPORARY: Using direct URLs until proxy is fixed
 */

/**
 * Convert a Supabase storage URL to use the sending domain proxy
 * @param supabaseUrl - The original Supabase storage URL
 * @returns The original URL (temporarily bypassing proxy)
 */
export const convertToSendingDomainUrl = (supabaseUrl: string | null | undefined): string | null => {
  // SIMPLE FIX: Return original URL since direct URLs work
  return supabaseUrl || null;
};

/**
 * Convert multiple Supabase URLs in a batch
 * @param urls - Array of Supabase URLs
 * @returns Array of converted URLs
 */
export const convertMultipleToSendingDomainUrls = (urls: (string | null | undefined)[]): (string | null)[] => {
  return urls.map(convertToSendingDomainUrl);
};