
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GoodsExchangeItem } from '@/types/localTypes';
import EditModeContent from '../items/dialogs/EditModeContent';
import ViewModeContent from '../items/dialogs/ViewModeContent';

/**
 * Props interface for the ItemRequestDialog component
 */
interface ItemRequestDialogProps {
  request: GoodsExchangeItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (updatedRequest: GoodsExchangeItem) => Promise<void>;
}

/**
 * ItemRequestDialog component
 * 
 * This dialog displays the details of an item exchange listing and
 * allows users to contact the poster or edit their own listings.
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

  // Handle canceling edit mode
  const handleCancel = () => {
    setIsEditing(false);
  };

  // If no request is provided, don't render anything
  if (!request) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {isEditing ? (
          // Edit Mode using the EditModeContent component
          <EditModeContent
            request={request}
            editForm={editForm}
            setEditForm={setEditForm}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          // View Mode using the ViewModeContent component
          <ViewModeContent
            request={request}
            onEdit={handleEditClick}
            onOpenChange={onOpenChange}
            onUpdate={onUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ItemRequestDialog;
