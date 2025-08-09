/**
 * Hook for super admin neighborhood creation with enhanced options
 * 
 * This hook provides super admins with the ability to create neighborhoods
 * with control over their membership status (join as member vs. observer only).
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
// Simplified neighborhood creation data (super admins now always observe)
interface SuperAdminNeighborhoodData {
  name: string;
  city?: string;
  state?: string;
  address?: string;
  timezone?: string;
}

export const useSuperAdminNeighborhoodCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const logger = createLogger('useSuperAdminNeighborhoodCreation');
  /**
   * Creates a neighborhood as a ghost admin (observer mode only)
   * @param neighborhoodData - The neighborhood data
   * @returns The created neighborhood ID or null if failed
   */
  const createNeighborhood = async (neighborhoodData: SuperAdminNeighborhoodData): Promise<string | null> => {
    setIsCreating(true);
    
    try {
      // 1) Log what we’re about to do (scoped to this module)
      logger.info('Creating neighborhood as observer', neighborhoodData);
      
      // 2) Ask Postgres (via RPC) to create the neighborhood without adding the caller as a member
      const { data, error } = await supabase.rpc('create_neighborhood_as_super_admin_with_options', {
        neighborhood_name: neighborhoodData.name,
        neighborhood_city: neighborhoodData.city || null,
        neighborhood_state: neighborhoodData.state || null, 
        neighborhood_address: neighborhoodData.address || null,
        neighborhood_timezone: neighborhoodData.timezone || 'America/Los_Angeles',
        join_as_member: false // Explicitly specify to resolve function ambiguity
      });

      if (error) {
        logger.error('Error creating neighborhood', error);
        toast.error(`Failed to create neighborhood: ${error.message}`);
        return null;
      }

      logger.info('Neighborhood created successfully', { neighborhoodId: data });
      toast.success(`Neighborhood "${neighborhoodData.name}" created successfully as observer!`);
      
      // 3) Return the newly created neighborhood ID to the caller
      return data; // neighborhood ID

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
      // 1) Create the invitation record via RPC (DB handles code generation)
      logger.info('Creating admin invitation', { email, neighborhoodId });
      const { data: invitationId, error } = await supabase.rpc('create_admin_invitation', {
        target_email: email,
        target_neighborhood_id: neighborhoodId,
        invitation_message: message || null
      });

      if (error) {
        logger.error('Error creating admin invitation', error);
        toast.error(`Failed to create admin invitation: ${error.message}`);
        return null;
      }

      // 2) Fetch invite_code and neighborhood name to build a user-friendly invite URL
      const [{ data: inviteRow }, { data: neighborhoodRow }] = await Promise.all([
        supabase.from('invitations').select('invite_code').eq('id', invitationId as string).single(),
        supabase.from('neighborhoods').select('name').eq('id', neighborhoodId).single()
      ]);

      const inviteCode = inviteRow?.invite_code;
      const neighborhoodName = neighborhoodRow?.name || 'your neighborhood';

      // Build invite URL for email — always use the public production domain
      const baseUrl = 'https://neighborhoodos.com';
      const inviteUrl = inviteCode ? `${baseUrl}/join/${inviteCode}` : undefined;

      // 3) Fire-and-forget email via Edge Function if we have a URL
      if (inviteUrl) {
        const inviterName = 'NeighborhoodOS'; // We don’t have profile context in this hook
        const { error: emailError } = await supabase.functions.invoke('send-invitation', {
          body: {
            recipientEmail: email,
            inviterName,
            neighborhoodName,
            inviteUrl
          }
        });

        if (emailError) {
          // Log but don’t block the flow; the admin can still copy the invite link
          logger.warn('Invitation email failed to send; link still created', { emailError, inviteUrl });
        } else {
          logger.info('Invitation email queued', { email, inviteUrl });
        }
      } else {
        logger.warn('No invite code available after creation; email not sent');
      }

      toast.success(`Admin invitation ${inviteUrl ? 'sent' : 'created'} for ${email}`);
      return invitationId as string;

    } catch (error: any) {
      logger.error('Unexpected error creating invitation', error);
      toast.error('An unexpected error occurred while sending the invitation.');
      return null;
    }
  };
  /**
   * Allows super admin to join as an actual member of a neighborhood
   * @param neighborhoodId - The ID of the neighborhood to join
   * @returns Success status
   */
  const joinAsActualMember = async (neighborhoodId: string): Promise<boolean> => {
    try {
      console.log('[useSuperAdminNeighborhoodCreation] Joining neighborhood as member:', neighborhoodId);
      
      const { data, error } = await supabase.rpc('join_neighborhood_as_super_admin', {
        neighborhood_uuid: neighborhoodId
      });

      if (error) {
        console.error('[useSuperAdminNeighborhoodCreation] Error joining neighborhood:', error);
        toast.error(`Failed to join neighborhood: ${error.message}`);
        return false;
      }

      console.log('[useSuperAdminNeighborhoodCreation] Successfully joined as member:', data);
      toast.success('Successfully joined neighborhood as member!');
      
      return true;
      
    } catch (error: any) {
      console.error('[useSuperAdminNeighborhoodCreation] Unexpected error joining:', error);
      toast.error('An unexpected error occurred while joining the neighborhood.');
      return false;
    }
  };

  return {
    createNeighborhood,
    createAdminInvitation,
    joinAsActualMember,
    isCreating
  };
};