
// Import React dependencies and types
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dispatch, SetStateAction } from 'react';
// Import Avatar component for profile pictures
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Import popover components for click-to-expand functionality
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// Import Link component for navigation
import { Link } from "react-router-dom";
// Import Trash2 icon for delete functionality and useUser hook to check permissions
import { Trash2 } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";

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
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
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
  getUrgencyLabel,
  onDeleteItem,
  isDeletingItem = false
}) => {
  // State to track which popover is currently open (if any)
  // We store the request ID as a string to track the open popover
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  
  // Get the current user to check if they're the creator of a request
  const currentUser = useUser();
  
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
            /* 
            * Card with Popover for click-to-expand
            * Each card is wrapped in a Popover component
            * The card itself is the trigger for the popover
            */
            <Popover 
              key={request.id}
              open={openPopoverId === request.id}
              onOpenChange={(open) => {
                // When opening, set this popover's ID as the open one
                // When closing, clear the open popover ID
                setOpenPopoverId(open ? request.id : null);
              }}
            >
              {/* Use the Card as the trigger for the Popover */}
              <PopoverTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-all duration-300 w-[250px] flex-shrink-0 relative group">
                  {/* Delete button - only shown for the creator when hovering */}
                  {currentUser && currentUser.id === request.user_id && onDeleteItem && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDeleteItem(request);
                      }}
                      disabled={isDeletingItem}
                      aria-label="Delete request"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <CardHeader className="pb-2">
                    <div className="flex flex-col">
                      {/* Title and urgency tag in a row */}
                      <div className="flex items-center justify-between">
                        {/* Title on the left */}
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        
                        {/* Urgency tag on the right of the title */}
                        {request.urgency && (
                          <span className={`${getUrgencyClass(request.urgency)} text-xs px-2 py-1 rounded-full ml-2 inline-block`}>
                            {getUrgencyLabel(request.urgency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Description is visible in the normal card view, but gets truncated */}
                    <p className="line-clamp-2">{request.description}</p>
                  </CardContent>
                </Card>
              </PopoverTrigger>
              
              {/* 
              * Popover content shows the expanded details
              * This appears when the card is clicked
              */}
              <PopoverContent className="w-[300px] p-0" sideOffset={5}>
                <Card className="border-0 shadow-none relative">
                  {/* Add delete button in the expanded view too */}
                  {currentUser && currentUser.id === request.user_id && onDeleteItem && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-10 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDeleteItem(request);
                      }}
                      disabled={isDeletingItem}
                      aria-label="Delete request"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <CardHeader className="pb-2">
                    {/* Title and urgency in a row with space-between */}
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      {request.urgency && (
                        <span className={`${getUrgencyClass(request.urgency)} text-xs px-2 py-1 rounded-full ml-2 inline-block`}>
                          {getUrgencyLabel(request.urgency)}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Full description with no truncation in the popover view */}
                    <p>{request.description}</p>
                    
                    {/* Posted by section with clickable username */}
                    <div className="mt-4">
                      <h5 className="text-sm font-semibold mb-1">Posted by:</h5>
                      {/* Make the username clickable if we have a user ID */}
                      {request.user_id ? (
                        <Link 
                          to={`/neighbors?user=${request.user_id}`}
                          className="text-sm text-primary hover:underline"
                          onClick={(e) => {
                            // Prevent the click from closing the popover
                            e.stopPropagation();
                          }}
                        >
                          {request.profiles?.display_name || "Anonymous"}
                        </Link>
                      ) : (
                        <span className="text-sm">{request.profiles?.display_name || "Anonymous"}</span>
                      )}
                    </div>
                    
                    {/* "I have this" button - remove tooltip wrapping */}
                    <Button 
                      variant="default" 
                      size="sm"
                      className="w-full mt-4"
                      onClick={(e) => {
                        // Prevent the click from closing the popover
                        e.stopPropagation();
                        window.open(createContactEmailLink(request), '_blank');
                      }}
                    >
                      I have this!
                    </Button>
                  </CardContent>
                </Card>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </div>
    </div>
  );
};

// Export the component and the helper function
export { createContactEmailLink };
export default GoodsRequestsSection;
