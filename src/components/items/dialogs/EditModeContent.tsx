
import React from 'react';
import { DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { GoodsExchangeItem } from '@/types/localTypes';

/**
 * Props for the EditModeContent component
 */
interface EditModeContentProps {
  request: GoodsExchangeItem;
  editForm: {
    title: string;
    description: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
  }>>;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

/**
 * EditModeContent component
 * 
 * This component shows the edit form when a user is editing an item request
 */
const EditModeContent: React.FC<EditModeContentProps> = ({
  request,
  editForm,
  setEditForm,
  onSave,
  onCancel
}) => {
  return (
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
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
};

export default EditModeContent;
