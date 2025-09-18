/**
 * AdminSettings - Neighborhood configuration
 * 
 * Features:
 * - Neighborhood details: Name, description, location, timezone
 * - Privacy settings: Neighborhood visibility, join requirements  
 * - Danger zone: Transfer ownership, delete neighborhood
 * 
 * Access control:
 * - Admin: Full access to all settings
 * - Steward: Read-only access (isReadOnly prop)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Settings, Shield, Trash2, UserCheck, Upload, X, Check, Loader2, MapPin, Plus, Minus, Edit3 } from 'lucide-react';
import { useNeighborhood } from '@/contexts/neighborhood';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCreateGroup, groupQueryKeys } from '@/hooks/useGroups';
import { createLogger } from '@/utils/logger';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import type { Tables } from '@/integrations/supabase/types';

interface AdminSettingsProps {
  isReadOnly: boolean;
}

const AdminSettings = ({ isReadOnly }: AdminSettingsProps) => {
  const { currentNeighborhood, refreshNeighborhoodData } = useNeighborhood();
  const { toast } = useToast();
  const logger = createLogger('AdminSettings');
  const navigate = useNavigate();
  const createGroupMutation = useCreateGroup();
  const queryClient = useQueryClient();

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    state: '',
    timezone: 'America/Los_Angeles',
    isPublic: true,
    requireApproval: false,
    allowInvites: true,
    inviteHeaderImageUrl: ''
  });
  
  // State for physical units configuration
  const [physicalUnitsConfig, setPhysicalUnitsConfig] = useState({
    physicalUnitType: 'street',
    physicalUnitLabel: '',
    physicalUnits: [] as string[]
  });
  
  // State for image upload and auto-save
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // State for physical units save tracking
  const [hasUnsavedPhysicalUnits, setHasUnsavedPhysicalUnits] = useState(false);
  const [isSavingPhysicalUnits, setIsSavingPhysicalUnits] = useState(false);
  
  // State for delete operation
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-save function with debouncing
  const autoSave = useCallback(async (fieldName: string, value: string | boolean) => {
    if (isReadOnly || !currentNeighborhood) return;
    
    setIsAutoSaving(true);
    setSaveStatus('saving');
    
    try {
      // Map form field names to database column names
      const dbFieldMap: Record<string, string> = {
        name: 'name',
        city: 'city',
        state: 'state',
        timezone: 'timezone',
        inviteHeaderImageUrl: 'invite_header_image_url',
        physicalUnitType: 'physical_unit_type',
        physicalUnitLabel: 'physical_unit_label',
        physicalUnits: 'physical_units'
      };
      
      const dbField = dbFieldMap[fieldName];
      if (!dbField) {
        // Fields not stored in database (description, privacy settings)
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
        return;
      }
      
      // Skip physical units fields from auto-save
      if (fieldName === 'physicalUnits' || fieldName === 'physicalUnitType' || fieldName === 'physicalUnitLabel') {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
        return;
      }
      
      // Update other fields normally
      const updateData: Record<string, any> = {
        [dbField]: value || null
      };
      
      const { error } = await supabase
        .from('neighborhoods')
        .update(updateData)
        .eq('id', currentNeighborhood.id);

      if (error) throw error;

      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      logger.error(`Error auto-saving ${fieldName}`, error as any);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      
      // Only show toast for non-physical unit field errors
      if (fieldName !== 'physicalUnits') {
        toast({
          title: "Auto-save Failed",
          description: `Failed to save ${fieldName}. Please try again.`,
          variant: "destructive",
        });
      }
    } finally {
      setIsAutoSaving(false);
    }
  }, [isReadOnly, currentNeighborhood, createGroupMutation, logger, toast]);

  // Simple debounce implementation
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  
  const debouncedAutoSave = useCallback((fieldName: string, value: string | boolean) => {
    // Clear existing timer for this field
    if (debounceTimers.current[fieldName]) {
      clearTimeout(debounceTimers.current[fieldName]);
    }
    
    // Set new timer
    debounceTimers.current[fieldName] = setTimeout(() => {
      autoSave(fieldName, value);
    }, 1000);
  }, [autoSave]);

  // Track if we're currently auto-saving to prevent state resets
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Initialize form data when neighborhood data loads
  useEffect(() => {
    if (currentNeighborhood && !hasUnsavedPhysicalUnits) {
      const neighborhood = currentNeighborhood as any; // Cast to access database properties
      setFormData({
        name: neighborhood.name || '',
        description: neighborhood.description || '', // Use actual neighborhood description
        city: neighborhood.city || '',
        state: neighborhood.state || '',
        timezone: neighborhood.timezone || 'America/Los_Angeles',
        isPublic: true, // Not stored in current schema
        requireApproval: false, // Not stored in current schema
        allowInvites: true, // Not stored in current schema
        inviteHeaderImageUrl: neighborhood.invite_header_image_url || ''
      });
      
      // Initialize physical units configuration
      logger.info('Loading physical units config from neighborhood', {
        neighborhoodId: neighborhood.id,
        physicalUnitType: neighborhood.physical_unit_type,
        physicalUnitLabel: neighborhood.physical_unit_label,
        physicalUnits: neighborhood.physical_units,
        physicalUnitsLength: neighborhood.physical_units?.length || 0
      });
      
      setPhysicalUnitsConfig({
        physicalUnitType: neighborhood.physical_unit_type || 'street',
        physicalUnitLabel: neighborhood.physical_unit_label || '',
        physicalUnits: Array.isArray(neighborhood.physical_units) ? neighborhood.physical_units : []
      });
      
      // Reset unsaved changes flag when data loads
      setHasUnsavedPhysicalUnits(false);
    }
  }, [currentNeighborhood, hasUnsavedPhysicalUnits, logger]);

  const handleInputChange = (field: string, value: string | boolean) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, [field]: value }));
    // Trigger auto-save for this field
    debouncedAutoSave(field, value);
  };

  const handlePhysicalUnitsChange = (field: string, value: string | string[]) => {
    if (isReadOnly) return;
    
    // Update local state only - no auto-save
    setPhysicalUnitsConfig(prev => ({ ...prev, [field]: value }));
    setHasUnsavedPhysicalUnits(true);
  };

  const addPhysicalUnit = () => {
    if (isReadOnly) return;
    const newUnits = [...physicalUnitsConfig.physicalUnits, ''];
    setPhysicalUnitsConfig(prev => ({ ...prev, physicalUnits: newUnits }));
    setHasUnsavedPhysicalUnits(true);
    
    // Focus the newly added input field after a brief delay
    setTimeout(() => {
      const inputs = document.querySelectorAll('input[placeholder*="Name"]:not([placeholder*="neighborhood"])');
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      if (lastInput) {
        lastInput.focus();
      }
    }, 100);
  };

  const removePhysicalUnit = (index: number) => {
    if (isReadOnly) return;
    const newUnits = physicalUnitsConfig.physicalUnits.filter((_, i) => i !== index);
    setPhysicalUnitsConfig(prev => ({ ...prev, physicalUnits: newUnits }));
    setHasUnsavedPhysicalUnits(true);
  };

  const updatePhysicalUnit = (index: number, value: string) => {
    if (isReadOnly) return;
    const newUnits = [...physicalUnitsConfig.physicalUnits];
    newUnits[index] = value;
    setPhysicalUnitsConfig(prev => ({ ...prev, physicalUnits: newUnits }));
    setHasUnsavedPhysicalUnits(true);
  };

  // Save physical units with proper validation and group creation
  const savePhysicalUnits = async () => {
    if (isReadOnly || !currentNeighborhood || !hasUnsavedPhysicalUnits) return;
    
    setIsSavingPhysicalUnits(true);
    
    try {
      // Validate physical units - remove empty strings
      const validUnits = physicalUnitsConfig.physicalUnits.filter(unit => unit.trim() !== '');
      
      // Check for duplicates
      const uniqueUnits = [...new Set(validUnits)];
      if (uniqueUnits.length !== validUnits.length) {
        toast({
          title: "Duplicate Units",
          description: "Please remove duplicate physical units.",
          variant: "destructive",
        });
        return;
      }
      
      const neighborhood = currentNeighborhood as any;
      const currentUnits = neighborhood.physical_units || [];
      
      // Update the physical units in the database
      const { error } = await supabase
        .from('neighborhoods')
        .update({
          physical_unit_type: physicalUnitsConfig.physicalUnitType,
          physical_unit_label: physicalUnitsConfig.physicalUnitLabel || null,
          physical_units: uniqueUnits
        })
        .eq('id', currentNeighborhood.id);

      if (error) throw error;
      
      // Find newly added units for group creation
      const addedUnits = uniqueUnits.filter(unit => !currentUnits.includes(unit));
      
      // Create groups for new physical units
      if (addedUnits.length > 0) {
        logger.info('Creating groups for new physical units', { addedUnits, neighborhoodId: currentNeighborhood.id });
        
        for (const unitName of addedUnits) {
          try {
            // Check if a group with this name already exists before creating
            const groupName = `${unitName} Group`;
            const { data: existingGroup } = await supabase
              .from('groups')
              .select('id')
              .eq('neighborhood_id', currentNeighborhood.id)
              .eq('name', groupName)
              .eq('status', 'active')
              .maybeSingle();

            if (existingGroup) {
              logger.info('Group already exists for physical unit, skipping creation', { 
                unitName, 
                groupName,
                neighborhoodId: currentNeighborhood.id 
              });
              continue;
            }

            await createGroupMutation.mutateAsync({
              name: groupName,
              description: `Residents of ${unitName}`,
              group_type: 'physical',
              physical_unit_value: unitName,
              is_private: false,
              max_members: 100
            });
            
            logger.info('Auto-created physical group', { unitName, neighborhoodId: currentNeighborhood.id });
          } catch (groupError) {
            logger.warn('Failed to auto-create group for physical unit', { 
              unitName, 
              error: groupError,
              neighborhoodId: currentNeighborhood.id 
            });
          }
        }
      }
      
      // Refresh caches and neighborhood data immediately
      queryClient.invalidateQueries({ 
        queryKey: ['physicalUnitsWithResidents', currentNeighborhood.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: groupQueryKeys.neighborhoodConfig(currentNeighborhood.id) 
      });
      queryClient.invalidateQueries({
        queryKey: groupQueryKeys.physicalUnits(currentNeighborhood.id)
      });
      
      // Force refresh of neighborhood data in context to update the physical_units
      refreshNeighborhoodData();
      
      // Update local state to reflect saved data
      setPhysicalUnitsConfig(prev => ({ ...prev, physicalUnits: uniqueUnits }));
      setHasUnsavedPhysicalUnits(false);
      
      toast({
        title: "Physical Units Saved",
        description: "Physical units configuration has been updated successfully.",
      });
    } catch (error) {
      logger.error('Error saving physical units', error as any);
      toast({
        title: "Save Failed",
        description: "Failed to save physical units. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPhysicalUnits(false);
    }
  };

  const handleSaveSettings = async () => {
    if (isReadOnly || !currentNeighborhood) return;
    
    try {
      // Update the neighborhood in the database
      const { error } = await supabase
        .from('neighborhoods')
        .update({
          name: formData.name,
          city: formData.city || null,
          state: formData.state || null,
          timezone: formData.timezone,
          invite_header_image_url: formData.inviteHeaderImageUrl || null,
          physical_unit_type: physicalUnitsConfig.physicalUnitType,
          physical_unit_label: physicalUnitsConfig.physicalUnitLabel || null,
          physical_units: physicalUnitsConfig.physicalUnits.filter(unit => unit.trim() !== ''),
        })
        .eq('id', currentNeighborhood.id);

      if (error) throw error;

      // Note: Not calling refreshNeighborhoodData() to avoid triggering unwanted neighborhood switching for super admins
      
      toast({
        title: "Settings Updated",
        description: "Neighborhood settings have been saved successfully.",
      });
    } catch (error) {
      logger.error('Error saving neighborhood settings', error as any);
      toast({
        title: "Error",
        description: "Failed to save neighborhood settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTransferOwnership = () => {
    // TODO: Implement ownership transfer
    toast({
      title: "Feature Coming Soon",
      description: "Ownership transfer will be implemented with proper safeguards.",
    });
  };

  /**
   * Handle neighborhood deletion with confirmation
   * 
   * This function implements secure neighborhood deletion by:
   * 1. Showing a confirmation dialog to prevent accidental deletion
   * 2. Calling the server-side admin_delete_neighborhood function
   * 3. Handling success/error cases with appropriate user feedback
   * 4. Redirecting the user after successful deletion
   */
  const handleDeleteNeighborhood = async () => {
    if (!currentNeighborhood) {
      toast({
        title: "Error",
        description: "No neighborhood found to delete.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      logger.info('Starting neighborhood deletion process', { neighborhoodId: currentNeighborhood.id });
      
      // Call the secure server-side deletion function
      const { data, error } = await supabase.rpc('admin_delete_neighborhood', {
        neighborhood_uuid: currentNeighborhood.id
      });

      if (error) {
        throw new Error(error.message);
      }

      // Check if the deletion was successful
      const result = data as any; // Type assertion for the response
      if (result && result.success) {
        logger.info('Neighborhood deleted successfully', { 
          neighborhoodId: currentNeighborhood.id,
          deletionLog: result.deletion_log 
        });
        
        // Show success message
        toast({
          title: "Neighborhood Deleted",
          description: "Your neighborhood and all associated data have been permanently deleted.",
        });

        // Navigate to home page after a brief delay to allow user to see the success message
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error(result?.error || 'Unknown error occurred during deletion');
      }
    } catch (error) {
      logger.error('Error deleting neighborhood', error as any);
      
      // Show error message
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete neighborhood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle image upload for invite header
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    
    const file = event.target.files?.[0];
    if (!file || !currentNeighborhood) return;

    // Check file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `invite-header-${currentNeighborhood.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('neighborhood-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('neighborhood-assets')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        // Update form data with the new image URL
        const newImageUrl = urlData.publicUrl;
        setFormData(prev => ({ ...prev, inviteHeaderImageUrl: newImageUrl }));
        
        // Trigger auto-save for the new image URL
        autoSave('inviteHeaderImageUrl', newImageUrl);
        
        toast({
          title: "Image Uploaded",
          description: "Header image uploaded and saved successfully.",
        });
      }
    } catch (error) {
      logger.error('Error uploading image', error as any);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Remove header image
  const handleRemoveImage = () => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, inviteHeaderImageUrl: '' }));
    // Trigger auto-save to remove the image URL
    autoSave('inviteHeaderImageUrl', '');
  };

  return (
    <div className="space-y-6">
      {/* Header with Auto-save Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">
            {isReadOnly 
              ? "View neighborhood configuration (read-only access)"
              : "Configure your neighborhood settings - changes save automatically"
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!isReadOnly && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg border">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Saved</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">Save failed</span>
                </>
              )}
              {saveStatus === 'idle' && (
                <>
                  <Settings className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Auto-save enabled</span>
                </>
              )}
            </div>
          )}
          {isReadOnly && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Shield className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">Read Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Configure your neighborhood's basic details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="neighborhood-name">Neighborhood Name</Label>
              <Input
                id="neighborhood-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter neighborhood name"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={formData.timezone} 
                onValueChange={(value) => handleInputChange('timezone', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your neighborhood..."
              className="min-h-[100px]"
              disabled={isReadOnly}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter city"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Enter state"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Invite Header Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="invite-header">Invite Header Image</Label>
            <p className="text-sm text-muted-foreground">
              Upload an image that will appear at the top of your neighborhood invite links.
            </p>
            
            {formData.inviteHeaderImageUrl ? (
              <div className="space-y-2">
                <div 
                  className="relative w-full h-32 rounded-lg overflow-hidden border cursor-pointer group"
                  onClick={() => !isReadOnly && document.getElementById('invite-header-image-upload')?.click()}
                >
                  <img 
                    src={formData.inviteHeaderImageUrl} 
                    alt="Invite header preview"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  
                  {/* Hover overlay with animation */}
                  {!isReadOnly && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center text-white">
                        <Upload className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">Replace Image</p>
                        <p className="text-xs">Click to upload new photo</p>
                      </div>
                    </div>
                  )}
                  
                  {!isReadOnly && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 opacity-80 hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {/* Image guidelines caption */}
                <p className="text-xs text-muted-foreground">
                  <strong>Recommended:</strong> 16:9 aspect ratio (e.g., 1200×675px) • JPG or PNG • Max 5MB
                </p>
              </div>
            ) : (
              !isReadOnly && (
                <div className="space-y-2">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors duration-200 hover-scale"
                    onClick={() => document.getElementById('invite-header-image-upload')?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {isUploadingImage ? 'Uploading...' : 'Click to upload header image'}
                    </p>
                  </div>
                  
                  {/* Image guidelines caption */}
                  <p className="text-xs text-muted-foreground">
                    <strong>Recommended:</strong> 16:9 aspect ratio (e.g., 1200×675px) • JPG or PNG • Max 5MB
                  </p>
                </div>
              )
            )}
            
            {!isReadOnly && (
              <>
                {/* Hidden file input dedicated to the header image uploader.
                    We use a unique ID so document.getElementById targets THIS input, not others on the page. */}
                <input
                  id="invite-header-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Physical Units Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Physical Groups
          </CardTitle>
          <CardDescription>
            Define the physical grouping units for your neighborhood (e.g., streets, buildings, floors)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="physical-unit-type">Physical Unit Type</Label>
              <Select 
                value={physicalUnitsConfig.physicalUnitType} 
                onValueChange={(value) => handlePhysicalUnitsChange('physicalUnitType', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="street">Street</SelectItem>
                  <SelectItem value="floor">Floor</SelectItem>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {physicalUnitsConfig.physicalUnitType === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="physical-unit-label">Custom Label</Label>
                <Input
                  id="physical-unit-label"
                  value={physicalUnitsConfig.physicalUnitLabel}
                  onChange={(e) => handlePhysicalUnitsChange('physicalUnitLabel', e.target.value)}
                  placeholder="Enter custom unit name"
                  disabled={isReadOnly}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Physical Units List</Label>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPhysicalUnit}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Add the specific {physicalUnitsConfig.physicalUnitType}s in your neighborhood for group organization.
            </p>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {physicalUnitsConfig.physicalUnits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No physical units defined yet</p>
                  <p className="text-sm">Click "Add" to get started</p>
                </div>
              ) : (
                physicalUnitsConfig.physicalUnits.map((unit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={unit}
                      onChange={(e) => updatePhysicalUnit(index, e.target.value)}
                      placeholder={`${physicalUnitsConfig.physicalUnitType.charAt(0).toUpperCase() + physicalUnitsConfig.physicalUnitType.slice(1)} Name`}
                      disabled={isReadOnly}
                    />
                     {!isReadOnly && (
                       <Button
                         type="button"
                         variant="ghost"
                         size="sm"
                         onClick={() => removePhysicalUnit(index)}
                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
                       >
                         <Minus className="h-4 w-4" />
                       </Button>
                     )}
                  </div>
                ))
              )}
            </div>
            
            {/* Save Physical Units Button */}
            {!isReadOnly && hasUnsavedPhysicalUnits && (
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  onClick={savePhysicalUnits}
                  disabled={isSavingPhysicalUnits}
                  className="w-full"
                >
                  {isSavingPhysicalUnits ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving Physical Units...
                    </>
                  ) : (
                    'Save Physical Units'
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Access</CardTitle>
          <CardDescription>
            Control who can see and join your neighborhood
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Neighborhood</Label>
              <p className="text-sm text-muted-foreground">
                Allow your neighborhood to be discovered by others
              </p>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
              disabled={isReadOnly}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Approval</Label>
              <p className="text-sm text-muted-foreground">
                New members must be approved before joining
              </p>
            </div>
            <Switch
              checked={formData.requireApproval}
              onCheckedChange={(checked) => handleInputChange('requireApproval', checked)}
              disabled={isReadOnly}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Member Invites</Label>
              <p className="text-sm text-muted-foreground">
                Let members invite others to the neighborhood
              </p>
            </div>
            <Switch
              checked={formData.allowInvites}
              onCheckedChange={(checked) => handleInputChange('allowInvites', checked)}
              disabled={isReadOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone - Admin Only */}
      {!isReadOnly && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that affect your entire neighborhood
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-medium">Transfer Ownership</h3>
                <p className="text-sm text-muted-foreground">
                  Transfer admin control to another member
                </p>
              </div>
              <Button variant="outline" onClick={handleTransferOwnership}>
                <UserCheck className="h-4 w-4 mr-2" />
                Transfer
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-medium text-red-600">Delete Neighborhood</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this neighborhood and all its data
                </p>
              </div>
              
              {/* Delete confirmation dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Neighborhood Forever?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your 
                      neighborhood "{currentNeighborhood?.name}" and remove all 
                      associated data including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>All events and RSVPs</li>
                        <li>All safety updates and comments</li>
                        <li>All skills and goods exchange posts</li>
                        <li>All member data and neighborhood roles</li>
                        <li>All invitations and shared items</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteNeighborhood}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Yes, delete forever'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSettings;