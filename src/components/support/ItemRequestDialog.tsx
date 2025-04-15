import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GoodsExchangeItem } from '@/types/localTypes';
import { Edit2, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

// Update the interface to be more specific about Item Exchange
interface ItemRequestDialogProps {
  request: GoodsExchangeItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (updatedRequest: GoodsExchangeItem) => Promise<void>;
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
 * ItemRequestDialog component
 * 
 * Displays and allows editing of item exchange items on the Items page.
 * This replaces the legacy support request dialog with a specialized 
 * component for the Item Exchange functionality.
 */
const ItemRequestDialog: React.FC<ItemRequestDialogProps> = ({ 
  request, 
  open, 
  onOpenChange,
  onUpdate 
}) => {
  // Add state for edit mode and form data
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: ''
  });

  // Initialize edit form when entering edit mode
  const handleEditClick = () => {
    if (request) {
      setEditForm({
        title: request.title,
        description: request.description || ''
      });
      setIsEditing(true);
    }
  };

  // Handle save changes
  const handleSave = async () => {
    if (request && onUpdate) {
      await onUpdate({
        ...request,
        title: editForm.title,
        description: editForm.description
      });
      setIsEditing(false);
    }
  };

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
        {isEditing ? (
          // Edit Mode
          <>
            <DialogHeader>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg font-semibold"
              />
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[100px]"
              />
              
              {/* Image Preview in Edit Mode */}
              {request.image_url && (
                <div className="relative">
                  <img 
                    src={request.image_url} 
                    alt={editForm.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </>
        ) : (
          // View Mode
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
                    onClick={handleEditClick}
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export { createContactEmailLink };
export default ItemRequestDialog;
