
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { GoodsExchangeItem } from '@/types/localTypes';
import { createContactEmailLink } from '../utils/contactUtils';

/**
 * Props for the ViewModeContent component
 */
interface ViewModeContentProps {
  request: GoodsExchangeItem;
  onEdit: () => void;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (updatedRequest: GoodsExchangeItem) => Promise<void>;
}

/**
 * ViewModeContent component
 * 
 * This component shows the view-only mode when a user is looking at an item request
 */
const ViewModeContent: React.FC<ViewModeContentProps> = ({
  request,
  onEdit,
  onOpenChange,
  onUpdate
}) => {
  // Determine the text for the action button based on request type
  const actionButtonText = request.request_type === 'need' 
    ? 'I Can Help' 
    : 'I\'m Interested';

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle>{request.title}</DialogTitle>
            <DialogDescription>
              Posted by {request.profiles?.display_name || "Anonymous"}
            </DialogDescription>
          </div>
          {onUpdate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogHeader>
      
      <div className="mt-4">
        {/* Image Preview */}
        {request.image_url && (
          <div className="mb-4">
            <img 
              src={request.image_url} 
              alt={request.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
        
        <p className="mb-4">{request.description}</p>
        
        <div className="flex justify-end mt-4 space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button 
            onClick={() => window.open(createContactEmailLink(request), '_blank')}
          >
            {actionButtonText}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ViewModeContent;
