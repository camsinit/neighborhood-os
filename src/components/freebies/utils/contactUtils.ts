
import { GoodsExchangeItem } from '@/types/localTypes';

/**
 * Create a contact email link for the action button
 * This formats the email with a helpful subject and body text
 * 
 * @param request - The freebie request to create a contact link for
 * @returns A properly formatted mailto link
 */
export const createContactEmailLink = (request: GoodsExchangeItem | null) => {
  // If no request or no profile, return a basic mailto link
  if (!request || !request.profiles) {
    return "mailto:?subject=About your freebie on Neighborhood App";
  }
  
  // Get display name and item details
  const posterName = request.profiles.display_name || "Neighbor";
  const itemTitle = request.title || "your posted freebie";
  
  // Create a well-formatted email subject
  const subject = encodeURIComponent(`About your freebie: ${itemTitle}`);
  
  // Create a helpful email body with greeting and context
  const body = encodeURIComponent(
    `Hi ${posterName},\n\nI saw your post for "${itemTitle}" on our neighborhood app and I'm interested. `+
    `\n\nLet me know when would be a good time to connect about this.\n\nThanks!`
  );
  
  // Use the poster's email if available, otherwise leave blank
  const email = request.profiles.email || "";
  
  // Return the formatted mailto link
  return `mailto:${email}?subject=${subject}&body=${body}`;
};
