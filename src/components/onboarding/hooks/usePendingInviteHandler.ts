
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook for handling pending invite codes during onboarding
 */
export const usePendingInviteHandler = () => {
  const { toast } = useToast();

  /**
   * Handle joining neighborhood via pending invite code
   */
  const handlePendingInviteJoin = async (userId: string) => {
    const pendingInviteCode = localStorage.getItem('pendingInviteCode');
    
    console.log("[usePendingInviteHandler] handlePendingInviteJoin called");
    console.log("[usePendingInviteHandler] Pending invite code:", pendingInviteCode);
    console.log("[usePendingInviteHandler] User ID:", userId);
    
    if (!pendingInviteCode || !userId) {
      console.log("[usePendingInviteHandler] No pending invite code or user, skipping join");
      return;
    }

    try {
      console.log("[usePendingInviteHandler] Getting neighborhood from invite code");
      
      // Get neighborhood info from invite code
      const { data: neighborhoodData, error: functionError } = await supabase
        .rpc('get_neighborhood_from_invite', { 
          invite_code_param: pendingInviteCode 
        });

      if (functionError || !neighborhoodData || neighborhoodData.length === 0) {
        console.error("[usePendingInviteHandler] Invalid or expired invite code", functionError);
        localStorage.removeItem('pendingInviteCode');
        return;
      }

      const result = neighborhoodData[0];
      console.log("[usePendingInviteHandler] Neighborhood data:", result);
      
      // Check if invitation is still pending
      if (result.invitation_status !== 'pending') {
        console.log("[usePendingInviteHandler] Invitation no longer pending:", result.invitation_status);
        localStorage.removeItem('pendingInviteCode');
        return;
      }

      console.log("[usePendingInviteHandler] Adding user to neighborhood");
      
      // Add user as a neighborhood member
      const { error: memberError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: userId,
          neighborhood_id: result.neighborhood_id,
          status: 'active'
        });

      if (memberError) {
        console.error("[usePendingInviteHandler] Error joining neighborhood:", memberError);
        return;
      }

      console.log("[usePendingInviteHandler] Marking invitation as accepted");
      
      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by_id: userId,
          accepted_at: new Date().toISOString()
        })
        .eq('invite_code', pendingInviteCode);

      if (inviteError) {
        console.warn("[usePendingInviteHandler] Failed to update invitation status:", inviteError);
      }

      // Clean up stored invite code
      localStorage.removeItem('pendingInviteCode');
      console.log("[usePendingInviteHandler] Successfully joined neighborhood via invite");
      
      // Show success message
      toast({
        title: "Welcome!",
        description: `You've successfully joined ${result.neighborhood_name}!`,
      });

    } catch (error: any) {
      console.error("[usePendingInviteHandler] Error processing pending invite:", error);
      localStorage.removeItem('pendingInviteCode');
    }
  };

  return { handlePendingInviteJoin };
};
