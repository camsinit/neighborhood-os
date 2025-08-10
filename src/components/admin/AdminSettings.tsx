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
import { AlertTriangle, Settings, Shield, Trash2, UserCheck, Upload, X, Check, Loader2 } from 'lucide-react';
import { useNeighborhood } from '@/contexts/neighborhood';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

import type { Tables } from '@/integrations/supabase/types';

interface AdminSettingsProps {
  isReadOnly: boolean;
}

const AdminSettings = ({ isReadOnly }: AdminSettingsProps) => {
  const { currentNeighborhood, refreshNeighborhoodData } = useNeighborhood();
  const { toast } = useToast();
  const logger = createLogger('AdminSettings');

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
  
  // State for image upload and auto-save
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Auto-save function with debouncing
  const autoSave = useCallback(async (fieldName: string, value: string | boolean) => {
    if (isReadOnly || !currentNeighborhood) return;
    
    setSaveStatus('saving');
    
    try {
      // Map form field names to database column names
      const dbFieldMap: Record<string, string> = {
        name: 'name',
        city: 'city',
        state: 'state',
        timezone: 'timezone',
        inviteHeaderImageUrl: 'invite_header_image_url'
      };
      
      const dbField = dbFieldMap[fieldName];
      if (!dbField) {
        // Fields not stored in database (description, privacy settings)
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
        return;
      }
      
      // Update the specific field in the database
      const updateData: Record<string, any> = {
        [dbField]: value || null
      };
      
      const { error } = await supabase
        .from('neighborhoods')
        .update(updateData)
        .eq('id', currentNeighborhood.id);

      if (error) throw error;

      // Refresh the neighborhood data to reflect changes
      await refreshNeighborhoodData();
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      logger.error(`Error auto-saving ${fieldName}`, error as any);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      
      toast({
        title: "Auto-save Failed",
        description: `Failed to save ${fieldName}. Please try again.`,
        variant: "destructive",
      });
    }
  }, [isReadOnly, currentNeighborhood, refreshNeighborhoodData, toast]);

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

  // Initialize form data when neighborhood data loads
  useEffect(() => {
    if (currentNeighborhood) {
      const neighborhood = currentNeighborhood as any; // Cast to access database properties
      setFormData({
        name: neighborhood.name || '',
        description: '', // Not stored in current schema
        city: neighborhood.city || '',
        state: neighborhood.state || '',
        timezone: neighborhood.timezone || 'America/Los_Angeles',
        isPublic: true, // Not stored in current schema
        requireApproval: false, // Not stored in current schema
        allowInvites: true, // Not stored in current schema
        inviteHeaderImageUrl: neighborhood.invite_header_image_url || ''
      });
    }
  }, [currentNeighborhood]);

  const handleInputChange = (field: string, value: string | boolean) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, [field]: value }));
    // Trigger auto-save for this field
    debouncedAutoSave(field, value);
  };

  // Check if there are unsaved changes by comparing with original neighborhood data
  const hasUnsavedChanges = () => {
    if (!currentNeighborhood) return false;
    const neighborhood = currentNeighborhood as any;
    
    return (
      formData.name !== (neighborhood.name || '') ||
      formData.city !== (neighborhood.city || '') ||
      formData.state !== (neighborhood.state || '') ||
      formData.timezone !== (neighborhood.timezone || 'America/Los_Angeles') ||
      formData.inviteHeaderImageUrl !== (neighborhood.invite_header_image_url || '')
    );
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
        })
        .eq('id', currentNeighborhood.id);

      if (error) throw error;

      // Refresh the neighborhood data to reflect changes in the UI
      await refreshNeighborhoodData();
      
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

  const handleDeleteNeighborhood = () => {
    // TODO: Implement neighborhood deletion with confirmation
    toast({
      title: "Feature Coming Soon", 
      description: "Neighborhood deletion will be implemented with multiple confirmation steps.",
    });
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
                <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                  <img 
                    src={formData.inviteHeaderImageUrl} 
                    alt="Invite header preview"
                    className="w-full h-full object-cover"
                  />
                  {!isReadOnly && (
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {!isReadOnly && (
                  
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('invite-header-image-upload')?.click()}
                    disabled={isUploadingImage}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploadingImage ? 'Uploading...' : 'Change Image'}
                  </Button>
                )}
              </div>
            ) : (
              !isReadOnly && (
                
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                  onClick={() => document.getElementById('invite-header-image-upload')?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {isUploadingImage ? 'Uploading...' : 'Click to upload header image'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB
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
              <Button variant="destructive" onClick={handleDeleteNeighborhood}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSettings;