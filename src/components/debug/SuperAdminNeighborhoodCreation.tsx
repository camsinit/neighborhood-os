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

import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, Mail, Loader2, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { WaitlistManagementPanel } from './WaitlistManagementPanel';
import { useSuperAdminNeighborhoodCreation } from '@/hooks/useSuperAdminNeighborhoodCreation';
import { toast } from 'sonner';

interface NeighborhoodFormData {
  name: string;
  city: string;
  state: string;
  address: string;
  timezone: string;
}

interface AdminInvitationData {
  email: string;
  message: string;
}

export const SuperAdminNeighborhoodCreation: React.FC = () => {
  // Simplified state management - combine related states
  const [formData, setFormData] = useState<NeighborhoodFormData>({
    name: '',
    city: '',
    state: '',
    address: '',
    timezone: 'America/Los_Angeles'
  });

  const [invitationData, setInvitationData] = useState<AdminInvitationData>({
    email: '',
    message: ''
  });

  // Single state object for UI management
  const [uiState, setUiState] = useState({
    isFormExpanded: false,
    isInviting: false,
    createdNeighborhoodId: null as string | null,
    createdNeighborhoodName: ''
  });

  const { createNeighborhood, createAdminInvitation, joinAsActualMember, isCreating } = useSuperAdminNeighborhoodCreation();

  // Simplified event handlers - no need for detailed comments for simple functions
  const handleFormChange = (field: keyof NeighborhoodFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInvitationChange = (field: keyof AdminInvitationData, value: string) => {
    setInvitationData(prev => ({ ...prev, [field]: value }));
  };

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

    const neighborhoodId = await createNeighborhood({
      name: formData.name,
      city: formData.city || undefined,
      state: formData.state || undefined,
      address: formData.address || undefined,
      timezone: formData.timezone
    });

    if (neighborhoodId) {
      setUiState(prev => ({
        ...prev,
        createdNeighborhoodId: neighborhoodId,
        createdNeighborhoodName: formData.name
      }));
      
      // Reset form
      setFormData({
        name: '',
        city: '',
        state: '',
        address: '',
        timezone: 'America/Los_Angeles'
      });
    }
  };

  /**
   * Handles admin invitation submission
   */
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uiState.createdNeighborhoodId) {
      toast.error('Please create a neighborhood first before sending invitations.');
      return;
    }

    if (!invitationData.email.trim()) {
      toast.error('Email address is required');
      return;
    }

    setUiState(prev => ({ ...prev, isInviting: true }));

    try {
      const invitationId = await createAdminInvitation(
        invitationData.email,
        uiState.createdNeighborhoodId,
        invitationData.message || undefined
      );

      if (invitationId) {
        setInvitationData({ email: '', message: '' });
        setUiState(prev => ({
          ...prev,
          createdNeighborhoodId: null,
          createdNeighborhoodName: ''
        }));
      }
    } finally {
      setUiState(prev => ({ ...prev, isInviting: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Toggle for Neighborhood Creation */}
      <Button
        variant="outline"
        onClick={() => setUiState(prev => ({ ...prev, isFormExpanded: !prev.isFormExpanded }))}
        className="w-full justify-between h-auto p-3"
      >
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="font-medium">Create New Neighborhood</span>
          <span className="text-sm text-muted-foreground">
            (Observer Mode)
          </span>
        </div>
        {uiState.isFormExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Expandable Neighborhood Creation Form */}
      {uiState.isFormExpanded && (
        <Card>
          <CardContent className="pt-6">
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

            {/* Ghost Admin Info */}
            <div className="rounded-lg border border-border p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Observer Mode</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Super admins create neighborhoods as observers by default. You can view and debug without participating in community activities.
              </p>
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
          
          {/* Separator between form and waitlist */}
          <div className="border-t border-border my-6"></div>
          
          {/* Waitlist Management integrated within same container */}
          <WaitlistManagementPanel />
          
          </CardContent>
        </Card>
      )}

      {/* Admin Invitation Section */}
      {uiState.createdNeighborhoodId && (
        <>
          <Separator />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invite Neighborhood Admin
              </CardTitle>
              <CardDescription>
                Send an admin invitation for "{uiState.createdNeighborhoodName}"
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
                  disabled={uiState.isInviting}
                  className="w-full"
                >
                  {uiState.isInviting ? (
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