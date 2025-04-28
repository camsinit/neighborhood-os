// Import React dependencies and types
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import GoodsRequestCard from './GoodsRequestCard';

/**
 * Helper function to create a contact email link for an item
 * 
 * This formats an email with helpful subject and body text for contacting
 * the person who posted the item
 */
const createContactEmailLink = (request: GoodsExchangeItem) => {
  // Get display name and item details (with fallbacks)
  const posterName = request.profiles?.display_name || "Neighbor";
  const itemTitle = request.title || "your posted item";
  
  // Create a well-formatted email subject
  const subject = encodeURIComponent(`About your item: ${itemTitle}`);
  
  // Create a helpful email body with greeting and context
  const body = encodeURIComponent(
    `Hi ${posterName},\n\nI saw your post for "${itemTitle}" on our neighborhood app and I'd like to help. `+
    `\n\nLet me know when would be a good time to connect about this.\n\nThanks!`
  );
  
  // Use the poster's email if available, otherwise leave blank
  // Safely access the email property which might not exist
  const email = request.profiles?.email || "";
  
  // Return the formatted mailto link
  return `mailto:${email}?subject=${subject}&body=${body}`;
};

// Define the component's props interface
interface GoodsRequestsSectionProps {
  goodsRequests: GoodsExchangeItem[];
  urgentRequests: GoodsExchangeItem[];
  onRequestSelect: React.Dispatch<React.SetStateAction<GoodsExchangeItem | null>>;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

/**
 * GoodsRequestsSection component
 * 
 * Displays a list of regular (non-urgent) requests for goods
 * Now refactored to use the GoodsRequestCard component for better maintainability
 */
const GoodsRequestsSection: React.FC<GoodsRequestsSectionProps> = ({ 
  goodsRequests, 
  urgentRequests, 
  onRequestSelect,
  getUrgencyClass,
  getUrgencyLabel,
  onDeleteItem,
  isDeletingItem = false
}) => {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  
  const regularRequests = goodsRequests.filter(
    req => !urgentRequests.some(urgentReq => urgentReq.id === req.id)
  );
  
  if (regularRequests.length === 0) {
    return null;
  }

  return (
    <>
      {regularRequests.map((request) => (
        <GoodsRequestCard
          key={request.id}
          request={request}
          isOpen={openPopoverId === request.id}
          onOpenChange={(open) => {
            setOpenPopoverId(open ? request.id : null);
          }}
          getUrgencyClass={getUrgencyClass}
          getUrgencyLabel={getUrgencyLabel}
          onDeleteItem={onDeleteItem}
          isDeletingItem={isDeletingItem}
        />
      ))}
    </>
  );
};

// Export the component and the helper function
export { createContactEmailLink };
export default GoodsRequestsSection;
