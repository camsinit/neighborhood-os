/**
 * Convert Supabase storage URLs to use the sending domain for better email deliverability
 */

/**
 * Convert a Supabase storage URL to use the sending domain proxy
 * @param supabaseUrl - The original Supabase storage URL
 * @returns The proxied URL using the sending domain
 */
export const convertToSendingDomainUrl = (supabaseUrl: string | null | undefined): string | null => {
  if (!supabaseUrl) return null;
  
  // Extract the path from the Supabase URL
  // Example: https://nnwzfliblfuldwxpuata.supabase.co/storage/v1/object/public/neighborhood-assets/invite-header-xxx.png
  // Should become: https://updates.neighborhoodos.com/functions/v1/proxy-images?path=neighborhood-assets/invite-header-xxx.png
  
  try {
    const url = new URL(supabaseUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/(.+)/);
    
    if (pathMatch) {
      const imagePath = pathMatch[1];
      return `https://updates.neighborhoodos.com/functions/v1/proxy-images?path=${encodeURIComponent(imagePath)}`;
    }
  } catch (error) {
    console.error('Error converting Supabase URL:', error);
  }
  
  // Fallback to original URL if conversion fails
  return supabaseUrl;
};

/**
 * Convert multiple Supabase URLs in a batch
 * @param urls - Array of Supabase URLs
 * @returns Array of converted URLs
 */
export const convertMultipleToSendingDomainUrls = (urls: (string | null | undefined)[]): (string | null)[] => {
  return urls.map(convertToSendingDomainUrl);
};
