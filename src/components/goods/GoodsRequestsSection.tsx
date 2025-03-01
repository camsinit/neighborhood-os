
// Import React dependencies and types
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dispatch, SetStateAction } from 'react';
// Import Avatar component for profile pictures
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        <div className="flex gap-4 pb-2 relative">
          {regularRequests.map((request) => (
            /* 
            * Card with overlay hover effect
            * Using relative/absolute positioning to create the floating overlay effect
            * The z-index ensures that the hovered card appears above others
            */
            <div className="relative flex-shrink-0 w-[250px] group" key={request.id}>
              {/* Base card that's always visible */}
              <Card className="cursor-pointer hover:shadow-md transition-all duration-300 w-full">
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
                    
                    {/* Title and urgency tag in a row - changed to flex-row */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        {/* Title on the left */}
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        
                        {/* Urgency tag moved to the right of the title */}
                        {request.urgency && (
                          <span className={`${getUrgencyClass(request.urgency)} text-xs px-2 py-1 rounded-full ml-2 inline-block`}>
                            {getUrgencyLabel(request.urgency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Description is visible in the normal card view, but gets truncated */}
                  <p className="line-clamp-2">{request.description}</p>
                </CardContent>
              </Card>
              
              {/* 
              * Expanded overlay card that appears on hover
              * Fixed z-index to ensure it's above other content
              * Changed position to absolute and increased z-index significantly
              */}
              <Card 
                className="absolute left-0 top-0 w-[250px] opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                group-hover:w-[300px] group-hover:z-50 transition-all duration-300 shadow-xl"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage 
                        src={request.profiles?.avatar_url} 
                        alt={request.profiles?.display_name || "User"} 
                      />
                      <AvatarFallback>
                        {(request.profiles?.display_name || "?").substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Changed to flex-row with space-between to move urgency tag to the right */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        {request.urgency && (
                          <span className={`${getUrgencyClass(request.urgency)} text-xs px-2 py-1 rounded-full ml-2 inline-block`}>
                            {getUrgencyLabel(request.urgency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Full description with no truncation in the expanded view */}
                  {/* Removed the "Description:" heading as requested */}
                  <p>{request.description}</p>
                  
                  {/* Posted by section */}
                  <div className="mt-4">
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
                  
                  {/* Contact button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="w-full mt-4"
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
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Export the component and the helper function
export { createContactEmailLink };
export default GoodsRequestsSection;
