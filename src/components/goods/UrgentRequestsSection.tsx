
// Import React dependencies and types
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dispatch, SetStateAction } from 'react';

// Define the component's props interface
interface UrgentRequestsSectionProps {
  urgentRequests: GoodsExchangeItem[];
  onRequestSelect: Dispatch<SetStateAction<GoodsExchangeItem | null>>;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
}

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

/**
 * UrgentRequestsSection component
 * 
 * Displays a list of high-priority requests that need immediate attention
 */
const UrgentRequestsSection: React.FC<UrgentRequestsSectionProps> = ({ 
  urgentRequests, 
  onRequestSelect,
  getUrgencyClass,
  getUrgencyLabel
}) => {
  // If there are no urgent requests, don't render this section
  if (!urgentRequests || urgentRequests.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 mb-6">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Urgent Needs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {urgentRequests.map((request) => (
          <Card key={request.id} className="border-2 border-red-300">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{request.title}</CardTitle>
                {request.urgency && (
                  <span className={`${getUrgencyClass(request.urgency)} text-xs px-2 py-1 rounded-full`}>
                    {getUrgencyLabel(request.urgency)}
                  </span>
                )}
              </div>
              <CardDescription>
                Posted by {request.profiles?.display_name || "Anonymous"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="line-clamp-2">{request.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onRequestSelect(request)}
              >
                View Details
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => window.open(createContactEmailLink(request), '_blank')}
              >
                I Can Help
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Export the component and the helper function
export { createContactEmailLink };
export default UrgentRequestsSection;
