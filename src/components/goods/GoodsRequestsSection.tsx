
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
  // State to track which popover is currently open (if any)
  // We store the request ID as a string to track the open popover
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  
  // Filter out any requests that are already shown in the urgent section
  const regularRequests = goodsRequests.filter(
    req => !urgentRequests.some(urgentReq => urgentReq.id === req.id)
  );
  
  // If there are no regular requests, don't render this section
  if (regularRequests.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      {/* Section title is handled by parent component */}
      
      {/* Container for the horizontally scrollable cards */}
      <div className="p-4 rounded-lg overflow-x-auto">
        <div className="flex gap-4 pb-2 relative">
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
        </div>
      </div>
    </div>
  );
};

// Export the component and the helper function
export { createContactEmailLink };
export default GoodsRequestsSection;
