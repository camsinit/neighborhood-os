import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { useCreateGroup, useNeighborhoodPhysicalConfig } from '@/hooks/useGroups';
import { CreateGroupFormData } from '@/types/groups';
import { moduleThemeColors } from '@/theme/moduleTheme';

interface CreateGroupFormProps {
  onClose: () => void;
  initialData?: {
    name?: string;
    description?: string;
  };
}

export const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onClose, initialData }) => {
  const createGroupMutation = useCreateGroup();
  const { data: physicalConfig } = useNeighborhoodPhysicalConfig();
  
  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    group_type: 'social',
    is_private: false,
    physical_unit_value: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createGroupMutation.mutateAsync(formData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: initialData?.name || '',
      description: initialData?.description || '',
      group_type: 'social',
      is_private: false,
      physical_unit_value: undefined,
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const updateFormData = (field: keyof CreateGroupFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
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

      {/* Form Actions */}
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createGroupMutation.isPending || !formData.name.trim()}
          style={{ 
            backgroundColor: moduleThemeColors.neighbors.primary,
            borderColor: moduleThemeColors.neighbors.primary 
          }}
          className="hover:opacity-90"
        >
          {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
        </Button>
      </DialogFooter>
    </form>
  );
};