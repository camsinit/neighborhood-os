import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DialogFooter } from '@/components/ui/dialog';
import { useUpdateGroup } from '@/hooks/useGroups';
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
  // Get the update group mutation hook
  const updateGroupMutation = useUpdateGroup();
  
  // Form state initialized with current group data
  const [formData, setFormData] = useState<UpdateGroupFormData>({
    name: group.name,
    description: group.description || '',
    is_private: group.is_private,
    max_members: group.max_members,
  });

  // State for cover photo (banner image)
  const [bannerImageUrl, setBannerImageUrl] = useState<string | undefined>(group.banner_image_url || undefined);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover Photo Upload Section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Group Cover Photo</Label>
        <CoverPhotoUpload
          coverPhotoUrl={bannerImageUrl || null}
          onCoverPhotoChange={(url) => setBannerImageUrl(url || undefined)}
        />
      </div>

      {/* Group Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Group Name *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="Enter group name"
          required
          className="border-gray-300 focus:border-primary"
        />
      </div>

      {/* Group Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Describe your group..."
          rows={3}
          className="border-gray-300 focus:border-primary resize-none"
        />
      </div>

      {/* Privacy Setting */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Private Group</Label>
          <p className="text-xs text-gray-500">
            Private groups require approval to join
          </p>
        </div>
        <Switch
          checked={formData.is_private}
          onCheckedChange={(checked) => updateFormData('is_private', checked)}
        />
      </div>

      {/* Max Members Field */}
      <div className="space-y-2">
        <Label htmlFor="max_members" className="text-sm font-medium">
          Maximum Members
        </Label>
        <Input
          id="max_members"
          type="number"
          value={formData.max_members}
          onChange={(e) => updateFormData('max_members', parseInt(e.target.value))}
          placeholder="100"
          min="1"
          max="1000"
          className="border-gray-300 focus:border-primary"
        />
      </div>

      {/* Form Actions */}
      <DialogFooter className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateGroupMutation.isPending || !formData.name.trim()}
          style={{ 
            backgroundColor: moduleThemeColors.neighbors.primary,
            borderColor: moduleThemeColors.neighbors.primary 
          }}
          className="text-white hover:opacity-90"
        >
          {updateGroupMutation.isPending ? 'Updating...' : 'Update Group'}
        </Button>
      </DialogFooter>
    </form>
  );
};