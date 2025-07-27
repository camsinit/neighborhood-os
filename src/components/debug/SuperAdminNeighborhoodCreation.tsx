/**
 * SuperAdminNeighborhoodCreation component
 * 
 * Enhanced neighborhood creation interface for super admins with options for
 * membership control (join as member vs. observer only) and admin invitation functionality.
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, Mail, Loader2, UserPlus, Eye } from 'lucide-react';
import { useSuperAdminNeighborhoodCreation } from '@/hooks/useSuperAdminNeighborhoodCreation';
import { toast } from 'sonner';

interface NeighborhoodFormData {
  name: string;
  city: string;
  state: string;
  address: string;
  timezone: string;
  joinAsMember: boolean;
}

interface AdminInvitationData {
  email: string;
  message: string;
}

export const SuperAdminNeighborhoodCreation: React.FC = () => {
  // Form state for neighborhood creation
  const [formData, setFormData] = useState<NeighborhoodFormData>({
    name: '',
    city: '',
    state: '',
    address: '',
    timezone: 'America/Los_Angeles',
    joinAsMember: false
  });

  // State for admin invitation
  const [invitationData, setInvitationData] = useState<AdminInvitationData>({
    email: '',
    message: ''
  });

  // Track created neighborhood for invitation functionality
  const [createdNeighborhoodId, setCreatedNeighborhoodId] = useState<string | null>(null);
  const [createdNeighborhoodName, setCreatedNeighborhoodName] = useState<string>('');
  const [isInviting, setIsInviting] = useState(false);

  const { createNeighborhood, createAdminInvitation, isCreating } = useSuperAdminNeighborhoodCreation();

  /**
   * Handles form input changes for neighborhood creation
   */
  const handleFormChange = (field: keyof NeighborhoodFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handles form input changes for admin invitation
   */
  const handleInvitationChange = (field: keyof AdminInvitationData, value: string) => {
    setInvitationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Validates the neighborhood creation form
   */
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Neighborhood name is required');
      return false;
    }
    return true;
  };

  /**
   * Handles neighborhood creation form submission
   */
  const handleCreateNeighborhood = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    console.log('[SuperAdminNeighborhoodCreation] Creating neighborhood:', formData);

    const neighborhoodId = await createNeighborhood({
      name: formData.name,
      city: formData.city || undefined,
      state: formData.state || undefined,
      address: formData.address || undefined,
      timezone: formData.timezone,
      joinAsMember: formData.joinAsMember
    });

    if (neighborhoodId) {
      setCreatedNeighborhoodId(neighborhoodId);
      setCreatedNeighborhoodName(formData.name);
      
      // Reset form
      setFormData({
        name: '',
        city: '',
        state: '',
        address: '',
        timezone: 'America/Los_Angeles',
        joinAsMember: false
      });

      console.log('[SuperAdminNeighborhoodCreation] Neighborhood created successfully:', neighborhoodId);
    }
  };

  /**
   * Handles admin invitation submission
   */
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createdNeighborhoodId) {
      toast.error('Please create a neighborhood first before sending invitations.');
      return;
    }

    if (!invitationData.email.trim()) {
      toast.error('Email address is required');
      return;
    }

    setIsInviting(true);

    try {
      console.log('[SuperAdminNeighborhoodCreation] Sending admin invitation:', {
        email: invitationData.email,
        neighborhoodId: createdNeighborhoodId,
        message: invitationData.message
      });

      const invitationId = await createAdminInvitation(
        invitationData.email,
        createdNeighborhoodId,
        invitationData.message || undefined
      );

      if (invitationId) {
        // Reset invitation form
        setInvitationData({
          email: '',
          message: ''
        });
        
        // Clear created neighborhood state to allow for new creation
        setCreatedNeighborhoodId(null);
        setCreatedNeighborhoodName('');

        console.log('[SuperAdminNeighborhoodCreation] Admin invitation sent successfully:', invitationId);
      }
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Neighborhood Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Neighborhood
          </CardTitle>
          <CardDescription>
            Create a new neighborhood with control over your membership status
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleCreateNeighborhood} className="space-y-4">
            {/* Basic Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="neighborhood-name" className="text-sm font-medium">
                  Neighborhood Name *
                </Label>
                <Input
                  id="neighborhood-name"
                  type="text"
                  placeholder="Enter neighborhood name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm font-medium">
                  Timezone
                </Label>
                <Input
                  id="timezone"
                  type="text"
                  placeholder="America/Los_Angeles"
                  value={formData.timezone}
                  onChange={(e) => handleFormChange('timezone', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  City
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => handleFormChange('city', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium">
                  State
                </Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={(e) => handleFormChange('state', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Address (Optional)
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter neighborhood address"
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Membership Control */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {formData.joinAsMember ? (
                    <UserPlus className="h-4 w-4 text-primary" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label className="text-sm font-medium">
                    {formData.joinAsMember ? 'Join as Member' : 'Observer Only'}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.joinAsMember 
                    ? 'You will be added as an active member of this neighborhood'
                    : 'You will only observe this neighborhood without participating'
                  }
                </p>
              </div>
              <Switch
                checked={formData.joinAsMember}
                onCheckedChange={(checked) => handleFormChange('joinAsMember', checked)}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Neighborhood...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Neighborhood
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin Invitation Section */}
      {createdNeighborhoodId && (
        <>
          <Separator />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invite Neighborhood Admin
              </CardTitle>
              <CardDescription>
                Send an admin invitation for "{createdNeighborhoodName}"
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSendInvitation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-sm font-medium">
                    Admin Email Address *
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="Enter email address"
                    value={invitationData.email}
                    onChange={(e) => handleInvitationChange('email', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invitation-message" className="text-sm font-medium">
                    Custom Message (Optional)
                  </Label>
                  <Textarea
                    id="invitation-message"
                    placeholder="Add a personal message to the invitation..."
                    value={invitationData.message}
                    onChange={(e) => handleInvitationChange('message', e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isInviting}
                  className="w-full"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Admin Invitation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};