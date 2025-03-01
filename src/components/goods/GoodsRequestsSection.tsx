
// Import React dependencies and types
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dispatch, SetStateAction } from 'react';
// Import Avatar component for profile pictures
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Import icons for expanding/collapsing cards
import { ChevronDown, ChevronUp } from "lucide-react";
// Import components for creating expandable sections
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Define the component's props interface
interface GoodsRequestsSectionProps {
  goodsRequests: GoodsExchangeItem[];
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
  
  // Track which request cards are expanded - use string type to match request.id type
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());
  
  // Toggle the expanded state of a card
  const toggleCardExpansion = (id: string) => {
    // Create a new Set based on the current state
    const newExpandedCards = new Set(expandedCardIds);
    
    // If the id exists in the set, remove it; otherwise add it
    if (newExpandedCards.has(id)) {
      newExpandedCards.delete(id);
    } else {
      newExpandedCards.add(id);
    }
    
    // Update the state with the new Set
    setExpandedCardIds(newExpandedCards);
  };
  
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
            <Collapsible 
              key={request.id} 
              className="flex-shrink-0 w-[250px]"
              open={expandedCardIds.has(request.id)}
              onOpenChange={() => toggleCardExpansion(request.id)}
            >
              <Card className="transition-all duration-200">
                {/* Card header section - always visible */}
                <CollapsibleTrigger className="w-full text-left">
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
                      
                      {/* Expansion indicator icon */}
                      <div className="flex items-center text-muted-foreground">
                        {expandedCardIds.has(request.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {/* Preview of description - always visible */}
                  <CardContent className="pb-2">
                    <p className="line-clamp-2">{request.description}</p>
                  </CardContent>
                </CollapsibleTrigger>
                
                {/* Expanded content - only visible when card is expanded */}
                <CollapsibleContent>
                  <div className="px-6 pb-4 pt-0">
                    {/* Full description without line clamping */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-1">Description:</h4>
                      <p>{request.description}</p>
                    </div>
                    
                    {/* Poster information */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-1">Posted by:</h4>
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
                        <span>{request.profiles?.display_name || "Anonymous"}</span>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent toggling the card when clicking the button
                          toggleCardExpansion(request.id); // Close the card
                        }}
                      >
                        Close
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent toggling the card when clicking the button
                          window.open(createContactEmailLink(request), '_blank');
                        }}
                      >
                        I have this!
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
};

// Export the component and the helper function
export { createContactEmailLink };
export default GoodsRequestsSection;
