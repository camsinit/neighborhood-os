import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { useCreateGroup, useNeighborhoodPhysicalConfig } from '@/hooks/useGroups';
import { CreateGroupFormData } from '@/types/groups';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const createGroupMutation = useCreateGroup();
  const { data: physicalConfig } = useNeighborhoodPhysicalConfig();
  
  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: '',
    description: '',
    group_type: 'social',
    is_private: false,
    physical_unit_value: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createGroupMutation.mutateAsync(formData);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      group_type: 'social',
      is_private: false,
      physical_unit_value: undefined,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const updateFormData = (field: keyof CreateGroupFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="Enter group name..."
              required
            />
          </div>


          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe what this group is about..."
              rows={3}
            />
          </div>


          {/* Privacy Setting */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="is_private">Private Group</Label>
                <p className="text-sm text-gray-500">
                  Private groups require invitations to join
                </p>
              </div>
              <Switch
                id="is_private"
                checked={formData.is_private}
                onCheckedChange={(checked) => {
                  updateFormData('is_private', checked);
                  // Clear physical unit selection when making public
                  if (!checked) {
                    updateFormData('physical_unit_value', undefined);
                  }
                }}
              />
            </div>

            {/* Physical Unit Selection for Private Groups */}
            {formData.is_private && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="private_physical_unit">Limit to specific area</Label>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Optional</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Only neighbors from the selected area will be able to see and join this private group.
                </p>
                <Select
                  value={formData.physical_unit_value || ''}
                  onValueChange={(value) => updateFormData('physical_unit_value', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select a ${physicalConfig?.physical_unit_label?.toLowerCase() || 'area'} (optional)`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All areas</SelectItem>
                    {physicalConfig?.physical_units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {physicalConfig?.physical_units.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No specific areas configured for this neighborhood
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createGroupMutation.isPending || !formData.name.trim()}
            >
              {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};