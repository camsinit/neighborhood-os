
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Define the Invitation interface to represent our data structure
export interface Invitation {
  id: string;
  neighborhood_id: string;
  neighborhoods: {
    name: string;
  };
  inviter_id: string;
  status: 'pending' | 'accepted' | 'expired';
}

/**
 * Custom hook for handling neighborhood invitation logic
 * 
 * This hook encapsulates all the logic for fetching, validating,
 * and accepting invitations to join a neighborhood.
 * 
 * @param inviteCode - The invitation code from the URL
 * @returns Various states and handlers for the invitation process
 */
export const useInvitation = (inviteCode: string | undefined) => {
  // Initialize state variables
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get current user, navigation and toast utilities
  const user = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch invitation data when component mounts or inviteCode changes
  useEffect(() => {
    async function fetchInvitation() {
      try {
        // Log the fetch operation for debugging
        console.log("[useInvitation] Fetching invitation:", inviteCode);
        
        // Query the database for the invitation matching the invite code
        const { data, error } = await supabase
          .from('invitations')
          .select(`
            *,
            neighborhoods (
              name
            )
          `)
          .eq('invite_code', inviteCode)
          .single();

        // Handle potential errors
        if (error) throw error;
        if (!data) {
          throw new Error('Invitation not found');
        }
        if (data.status === 'expired') {
          throw new Error('This invitation has expired');
        }
        if (data.status === 'accepted') {
          throw new Error('This invitation has already been used');
        }
        
        // Store the valid invitation in state
        console.log("[useInvitation] Invitation found:", data);
        setInvitation(data as Invitation);
      } catch (err) {
        // Log and store any errors that occur
        console.error("[useInvitation] Error fetching invitation:", err);
        setError(err instanceof Error ? err.message : 'Failed to load invitation');
      } finally {
        // Always mark loading as complete
        setLoading(false);
      }
    }

    // Only fetch if we have an invite code
    if (inviteCode) {
      fetchInvitation();
    } else {
      setError("No invitation code provided");
      setLoading(false);
    }
  }, [inviteCode]);

  // Function to handle successful joining
  const handleJoinComplete = () => {
    // Show a welcome toast message
    toast({
      title: "Welcome!",
      description: `You've successfully joined. Would you like to set up your profile?`,
    });
    
    // Navigate to the onboarding page with the invite code
    navigate(`/onboarding/${inviteCode}`);
  };

  // Function to process neighborhood joining
  const handleJoin = async () => {
    // Guard clause: exit if user or invitation is missing
    if (!user || !invitation) return;
    
    // Start joining process
    setJoining(true);
    try {
      // Check if user is already a member of this neighborhood
      const { data: existingMember } = await supabase
        .from('neighborhood_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('neighborhood_id', invitation.neighborhood_id)
        .single();
        
      // If already a member, inform user and redirect
      if (existingMember) {
        toast({
          title: "Already a member",
          description: "You are already a member of this neighborhood.",
        });
        navigate('/neighbors');
        return;
      }
      
      // Use our security definer function to safely add member
      const { error: memberError } = await supabase
        .rpc('add_neighborhood_member', {
          user_uuid: user.id,
          neighborhood_uuid: invitation.neighborhood_id
        });
      
      if (memberError) throw memberError;
      
      // Update invitation status to accepted
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);
        
      if (inviteError) throw inviteError;
      
      // Complete the join process
      handleJoinComplete();
    } catch (err) {
      // Handle errors during join process
      console.error("[useInvitation] Error joining neighborhood:", err);
      toast({
        title: "Error",
        description: "Failed to join neighborhood. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Always reset joining state
      setJoining(false);
    }
  };

  // Function to handle immediate joining (without profile setup)
  const handleQuickJoin = () => {
    handleJoin();
  };

  // Function to navigate to full onboarding flow
  const handleFullOnboarding = () => {
    // Redirect to onboarding flow with the invite code
    if (inviteCode) {
      navigate(`/onboarding/${inviteCode}`);
    }
  };

  // Return all state and handlers needed for the invitation process
  return {
    invitation,
    loading,
    joining,
    error,
    user,
    handleQuickJoin,
    handleFullOnboarding
  };
};
