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
      {/* Waitlist Management - Only way to create neighborhoods */}
      <WaitlistManagementPanel />
    </div>

  );
};