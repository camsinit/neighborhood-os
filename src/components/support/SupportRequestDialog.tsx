
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GoodsExchangeItem } from '@/types/localTypes';

// Define the component's props interface
interface SupportRequestDialogProps {
  request: GoodsExchangeItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Create a contact email link for the action button
 * This formats the email with a helpful subject and body text
 */
const createContactEmailLink = (request: any) => {
  // If no request or no profile, return a basic mailto link
  if (!request || !request.profiles) {
    return "mailto:?subject=About your item on Neighborhood App";
  }
  
  // Get display name and item details
  const posterName = request.profiles.display_name || "Neighbor";
  const itemTitle = request.title || "your posted item";
  
  // Create a well-formatted email subject
  const subject = encodeURIComponent(`About your item: ${itemTitle}`);
  
  // Create a helpful email body with greeting and context
  const body = encodeURIComponent(
    `Hi ${posterName},\n\nI saw your post for "${itemTitle}" on our neighborhood app and I'd like to help. `+
    `\n\nLet me know when would be a good time to connect about this.\n\nThanks!`
  );
  
  // Use the poster's email if available, otherwise leave blank
  const email = request.profiles.email || "";
  
  // Return the formatted mailto link
  return `mailto:${email}?subject=${subject}&body=${body}`;
};

/**
 * SupportRequestDialog component
 * 
 * A dialog that shows the details of a support request when clicked
 */
const SupportRequestDialog: React.FC<SupportRequestDialogProps> = ({ 
  request, 
  open, 
  onOpenChange 
}) => {
  if (!request) {
    return null;
  }

  // Determine the text for the action button based on request type
  const actionButtonText = request.request_type === 'need' 
    ? 'I Can Help' 
    : 'I\'m Interested';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{request.title}</DialogTitle>
          <DialogDescription>
            Posted by {request.profiles?.display_name || "Anonymous"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="mb-4">{request.description}</p>
          
          {request.image_url && (
            <div className="mb-4">
              <img 
                src={request.image_url} 
                alt={request.title} 
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
          
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
      </DialogContent>
    </Dialog>
  );
};

// Export the function and component
export { createContactEmailLink };
export default SupportRequestDialog;
