
// Import React dependencies and types
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dispatch, SetStateAction } from 'react';
// Import Avatar component for profile pictures
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Import HoverCard components for hover functionality
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
// Import tooltip components for additional UI enhancement
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  onRequestSelect: Dispatch<SetStateAction<GoodsExchangeItem | null>>;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
}

/**
 * GoodsRequestsSection component
 * 
 * Displays a list of regular (non-urgent) requests for goods
 */
const GoodsRequestsSection: React.FC<GoodsRequestsSectionProps> = ({ 
  goodsRequests, 
  urgentRequests, 
  onRequestSelect,
  getUrgencyClass,
  getUrgencyLabel
}) => {
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
      {/* Section title */}
      <h3 className="text-2xl font-bold mb-4">Requests from Neighbors</h3>
      
      {/* Container for the horizontally scrollable cards */}
      <div className="p-4 rounded-lg overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {regularRequests.map((request) => (
            <HoverCard key={request.id}>
              {/* The card that triggers the hover effect */}
              <HoverCardTrigger asChild>
                <Card className="flex-shrink-0 w-[250px] cursor-pointer hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-2">
                    {/* Layout with profile image to the left of the title */}
                    <div className="flex items-start gap-3">
                      {/* Avatar component for profile image */}
                      <Avatar className="h-8 w-8 mt-1">
                        {/* Use the avatar URL from the profile if available */}
                        <AvatarImage 
                          src={request.profiles?.avatar_url} 
                          alt={request.profiles?.display_name || "User"} 
                        />
                        {/* Fallback shows initials if no image is available */}
                        <AvatarFallback>
                          {(request.profiles?.display_name || "?").substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Title and urgency tag in a column */}
                      <div className="flex-1">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        {/* Urgency tag below the title */}
                        {request.urgency && (
                          <span className={`${getUrgencyClass(request.urgency)} text-xs px-2 py-1 rounded-full mt-1 inline-block`}>
                            {getUrgencyLabel(request.urgency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Show a preview of the description */}
                    <p className="line-clamp-2">{request.description}</p>
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              
              {/* Content that appears on hover */}
              <HoverCardContent className="w-80 p-4">
                {/* Full request details in the hover card */}
                <div className="space-y-4">
                  {/* Request title with larger font */}
                  <h4 className="text-lg font-semibold">{request.title}</h4>
                  
                  {/* Full description */}
                  <div>
                    <h5 className="text-sm font-semibold mb-1">Description:</h5>
                    <p className="text-sm text-gray-700">{request.description}</p>
                  </div>
                  
                  {/* Poster information */}
                  <div>
                    <h5 className="text-sm font-semibold mb-1">Posted by:</h5>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={request.profiles?.avatar_url} 
                          alt={request.profiles?.display_name || "User"} 
                        />
                        <AvatarFallback>
                          {(request.profiles?.display_name || "?").substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{request.profiles?.display_name || "Anonymous"}</span>
                    </div>
                  </div>
                  
                  {/* Action button with tooltip */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(createContactEmailLink(request), '_blank')}
                        >
                          I have this!
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Contact {request.profiles?.display_name || "the neighbor"} about this item</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </div>
  );
};

// Export the component and the helper function
export { createContactEmailLink };
export default GoodsRequestsSection;
