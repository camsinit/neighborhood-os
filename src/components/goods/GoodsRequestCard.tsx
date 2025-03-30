
/**
 * GoodsRequestCard Component
 * 
 * This component renders an individual goods request card with a popover for details
 * Extracted from GoodsRequestsSection for better maintainability
 */
import React from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { createContactEmailLink } from './GoodsRequestsSection';

// Define the component's props interface
interface GoodsRequestCardProps {
  request: GoodsExchangeItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

/**
 * GoodsRequestCard component
 * 
 * Displays a single goods request card with a popover for details
 */
const GoodsRequestCard: React.FC<GoodsRequestCardProps> = ({
  request,
  isOpen,
  onOpenChange,
  getUrgencyClass,
  getUrgencyLabel,
  onDeleteItem,
  isDeletingItem = false
}) => {
  // Get the current user to check if they're the creator of a request
  const currentUser = useUser();
  
  return (
    <Popover 
      open={isOpen}
      onOpenChange={onOpenChange}
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
                // Stop event propagation to prevent popover from opening
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
      
      {/* Popover content shows the expanded details */}
      <PopoverContent className="w-[300px] p-0" sideOffset={5}>
        <RequestDetailCard
          request={request}
          getUrgencyClass={getUrgencyClass}
          getUrgencyLabel={getUrgencyLabel}
          onDeleteItem={onDeleteItem}
          isDeletingItem={isDeletingItem}
        />
      </PopoverContent>
    </Popover>
  );
};

/**
 * RequestDetailCard component
 * 
 * Shows the full details of a request in the popover
 */
interface RequestDetailCardProps {
  request: GoodsExchangeItem;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
  onDeleteItem?: (item: GoodsExchangeItem) => Promise<void>;
  isDeletingItem?: boolean;
}

const RequestDetailCard: React.FC<RequestDetailCardProps> = ({
  request,
  getUrgencyClass,
  getUrgencyLabel,
  onDeleteItem,
  isDeletingItem
}) => {
  // Get the current user for permission checks
  const currentUser = useUser();
  
  return (
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
        
        {/* "I have this" button */}
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
  );
};

export default GoodsRequestCard;
