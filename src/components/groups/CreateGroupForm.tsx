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
import { CoverPhotoUpload } from './CoverPhotoUpload';
import { NeighborSearch } from './NeighborSearch';
import { NeighborhoodMember } from '@/hooks/useNeighborhoodMembers';

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
  
  // Form state with new fields for cover photo and invited neighbors
  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    group_type: 'social',
    is_private: false, // Always false for now
    physical_unit_value: undefined,
    banner_image_url: undefined,
    invited_neighbors: [],
  });

  // Local state for managing selected neighbors
  const [selectedNeighbors, setSelectedNeighbors] = useState<NeighborhoodMember[]>([]);

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
      is_private: false, // Always false for now
      physical_unit_value: undefined,
      banner_image_url: undefined,
      invited_neighbors: [],
    });
    setSelectedNeighbors([]);
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

  // Handle neighbor selection for invitations
  const handleNeighborSelect = (neighbor: NeighborhoodMember) => {
    const updatedNeighbors = [...selectedNeighbors, neighbor];
    setSelectedNeighbors(updatedNeighbors);
    updateFormData('invited_neighbors', updatedNeighbors.map(n => n.user_id));
  };

  const handleNeighborRemove = (neighborId: string) => {
    const updatedNeighbors = selectedNeighbors.filter(n => n.user_id !== neighborId);
    setSelectedNeighbors(updatedNeighbors);
    updateFormData('invited_neighbors', updatedNeighbors.map(n => n.user_id));
  };

  // Handle cover photo changes
  const handleCoverPhotoChange = (url: string | null) => {
    updateFormData('banner_image_url', url);
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

      {/* Cover Photo Upload */}
      <CoverPhotoUpload
        coverPhotoUrl={formData.banner_image_url || null}
        onCoverPhotoChange={handleCoverPhotoChange}
      />

      {/* Neighbor Search and Invite */}
      <NeighborSearch
        selectedNeighbors={selectedNeighbors}
        onNeighborSelect={handleNeighborSelect}
        onNeighborRemove={handleNeighborRemove}
      />


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