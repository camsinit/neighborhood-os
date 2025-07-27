/**
 * Hook for super admin neighborhood creation with enhanced options
 * 
 * This hook provides super admins with the ability to create neighborhoods
 * with control over their membership status (join as member vs. observer only).
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Enhanced neighborhood creation data including membership control
interface SuperAdminNeighborhoodData {
  name: string;
  city?: string;
  state?: string;
  address?: string;
  timezone?: string;
  joinAsMember: boolean; // New field to control super admin membership
}

export const useSuperAdminNeighborhoodCreation = () => {
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Creates a neighborhood using the super admin function with membership control
   * @param neighborhoodData - The neighborhood data including membership preference
   * @returns The created neighborhood ID or null if failed
   */
  const createNeighborhood = async (neighborhoodData: SuperAdminNeighborhoodData): Promise<string | null> => {
    setIsCreating(true);
    
    try {
      console.log('[useSuperAdminNeighborhoodCreation] Creating neighborhood:', neighborhoodData);
      
      // Call the super admin neighborhood creation function with options
      const { data, error } = await supabase.rpc('create_neighborhood_as_super_admin_with_options', {
        neighborhood_name: neighborhoodData.name,
        neighborhood_city: neighborhoodData.city || null,
        neighborhood_state: neighborhoodData.state || null, 
        neighborhood_address: neighborhoodData.address || null,
        neighborhood_timezone: neighborhoodData.timezone || 'America/Los_Angeles',
        join_as_member: neighborhoodData.joinAsMember
      });

      if (error) {
        console.error('[useSuperAdminNeighborhoodCreation] Error creating neighborhood:', error);
        toast.error(`Failed to create neighborhood: ${error.message}`);
        return null;
      }

      console.log('[useSuperAdminNeighborhoodCreation] Neighborhood created successfully:', data);
      
      const membershipStatus = neighborhoodData.joinAsMember ? 'as member' : 'as observer';
      toast.success(`Neighborhood "${neighborhoodData.name}" created successfully ${membershipStatus}!`);
      
      return data; // This is the neighborhood ID
      
    } catch (error: any) {
      console.error('[useSuperAdminNeighborhoodCreation] Unexpected error:', error);
      toast.error('An unexpected error occurred while creating the neighborhood.');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Creates an admin invitation for a specific neighborhood
   * @param email - The email address to send the invitation to
   * @param neighborhoodId - The ID of the neighborhood to invite admin for
   * @param message - Optional custom message for the invitation
   * @returns The invitation ID or null if failed
   */
  const createAdminInvitation = async (
    email: string, 
    neighborhoodId: string, 
    message?: string
  ): Promise<string | null> => {
    try {
      console.log('[useSuperAdminNeighborhoodCreation] Creating admin invitation:', {
        email,
        neighborhoodId,
        message
      });

      const { data, error } = await supabase.rpc('create_admin_invitation', {
        target_email: email,
        target_neighborhood_id: neighborhoodId,
        invitation_message: message || null
      });

      if (error) {
        console.error('[useSuperAdminNeighborhoodCreation] Error creating admin invitation:', error);
        toast.error(`Failed to send admin invitation: ${error.message}`);
        return null;
      }

      console.log('[useSuperAdminNeighborhoodCreation] Admin invitation created successfully:', data);
      toast.success(`Admin invitation sent to ${email}!`);
      
      return data; // This is the invitation ID
      
    } catch (error: any) {
      console.error('[useSuperAdminNeighborhoodCreation] Unexpected error creating invitation:', error);
      toast.error('An unexpected error occurred while sending the invitation.');
      return null;
    }
  };

  return {
    createNeighborhood,
    createAdminInvitation,
    isCreating
  };
};