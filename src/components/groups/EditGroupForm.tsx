import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { useUpdateGroup, useNeighborhoodPhysicalConfig, useDeleteGroup } from '@/hooks/useGroups';
import { UpdateGroupFormData, Group } from '@/types/groups';
import { moduleThemeColors } from '@/theme/moduleTheme';
import { CoverPhotoUpload } from './CoverPhotoUpload';

/**
 * Props for EditGroupForm component
 */
interface EditGroupFormProps {
  /** Function to call when form is closed */
  onClose: () => void;
  /** The group to edit with pre-populated data */
  group: Group;
}

/**
 * EditGroupForm Component
 * 
 * A form component for editing existing group information.
 * Pre-populates all fields with current group data and allows
 * group owners/moderators to make changes and save them.
 * 
 * @param onClose - Function to call when form is closed
 * @param group - The group object containing current data to pre-populate
 */
export const EditGroupForm: React.FC<EditGroupFormProps> = ({ onClose, group }) => {
  // Get the mutation hooks and physical config
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();
  const { data: physicalConfig } = useNeighborhoodPhysicalConfig();
  
  // Form state initialized with current group data
  const [formData, setFormData] = useState<UpdateGroupFormData>({
    name: group.name,
    description: group.description || '',
    is_private: group.is_private,
    max_members: group.max_members,
    // Add physical_unit_value if the group has it
    physical_unit_value: group.physical_unit_value || undefined,
  });

  // State for cover photo (banner image)
  const [bannerImageUrl, setBannerImageUrl] = useState<string | undefined>(group.banner_image_url || undefined);
  
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * Handles form submission
   * Updates the group with the new data and closes the form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Include banner image URL if it was changed
      const updateData = {
        ...formData,
        ...(bannerImageUrl !== group.banner_image_url && { banner_image_url: bannerImageUrl })
      };

      await updateGroupMutation.mutateAsync({
        groupId: group.id,
        updates: updateData
      });
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to update group:', error);
    }
  };

  /**
   * Resets form to original group data
   */
  const resetForm = () => {
    setFormData({
      name: group.name,
      description: group.description || '',
      is_private: group.is_private,
      max_members: group.max_members,
      physical_unit_value: group.physical_unit_value || undefined,
    });
    setBannerImageUrl(group.banner_image_url || undefined);
  };

  /**
   * Handles closing the form and resetting data
   */
  const handleClose = () => {
    onClose();
    resetForm();
  };

  /**
   * Updates a single field in the form data
   */
  const updateFormData = (field: keyof UpdateGroupFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handles group deletion with confirmation
   */
  const handleDeleteGroup = async () => {
    try {
      await deleteGroupMutation.mutateAsync(group.id);
      onClose(); // Close the form after successful deletion
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
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
        coverPhotoUrl={bannerImageUrl || null}
        onCoverPhotoChange={(url) => setBannerImageUrl(url || undefined)}
      />

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

      {/* Max Members Field */}
      <div className="space-y-2">
        <Label htmlFor="max_members">Maximum Members</Label>
        <Input
          id="max_members"
          type="number"
          value={formData.max_members}
          onChange={(e) => updateFormData('max_members', parseInt(e.target.value))}
          placeholder="100"
          min="1"
          max="1000"
        />
      </div>

      {/* Delete Group Section */}
      <div className="pt-4 border-t border-gray-200">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Danger Zone</h3>
          <p className="text-xs text-gray-500">
            Deleting a group will permanently remove all group content, members, and history. This action cannot be undone.
          </p>
          
          {!showDeleteConfirm ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
            >
              Delete Group
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-800">
                Are you sure you want to delete "{group.name}"?
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteGroup}
                  disabled={deleteGroupMutation.isPending}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700 border-red-600 hover:border-red-700"
                >
                  {deleteGroupMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={updateGroupMutation.isPending || !formData.name.trim()}
          style={{ 
            backgroundColor: moduleThemeColors.neighbors.primary,
            borderColor: moduleThemeColors.neighbors.primary 
          }}
          className="hover:opacity-90"
        >
          {updateGroupMutation.isPending ? 'Updating...' : 'Update Group'}
        </Button>
      </DialogFooter>
    </form>
  );
};