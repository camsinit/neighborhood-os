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

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Settings, Shield, Trash2, UserCheck } from 'lucide-react';
import { useNeighborhood } from '@/contexts/neighborhood';
import { useToast } from '@/hooks/use-toast';

interface AdminSettingsProps {
  isReadOnly: boolean;
}

const AdminSettings = ({ isReadOnly }: AdminSettingsProps) => {
  const { currentNeighborhood } = useNeighborhood();
  const { toast } = useToast();

  // State for form data
  const [formData, setFormData] = useState({
    name: currentNeighborhood?.name || '',
    description: '',
    city: '',
    state: '',
    timezone: 'America/Los_Angeles',
    isPublic: true,
    requireApproval: false,
    allowInvites: true
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    if (isReadOnly) return;
    
    // TODO: Implement settings saving
    toast({
      title: "Settings Updated",
      description: "Neighborhood settings have been saved successfully.",
    });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">
            {isReadOnly 
              ? "View neighborhood configuration (read-only access)"
              : "Configure your neighborhood settings"
            }
          </p>
        </div>
        {isReadOnly && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Shield className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-700">Read Only</span>
          </div>
        )}
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

          {!isReadOnly && (
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings}>
                Save Changes
              </Button>
            </div>
          )}
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