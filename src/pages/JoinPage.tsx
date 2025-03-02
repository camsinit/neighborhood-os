
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading";
import { useUser } from "@supabase/auth-helpers-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Define the Invitation interface for better type safety
interface Invitation {
  id: string;
  neighborhood_id: string;
  neighborhoods: {
    name: string;
  };
  inviter_id: string;
  status: 'pending' | 'accepted' | 'expired';
}

/**
 * JoinPage Component
 * 
 * This component handles the process of joining a neighborhood through an invitation link.
 * It validates the invite code, shows relevant UI states, and processes the join request.
 */
const JoinPage = () => {
  // Get the invite code from the URL parameters
  const { inviteCode } = useParams();
  
  // State variables to track the component's status
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the current user and navigation tools
  const user = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Effect to fetch and validate the invitation when the component loads
  useEffect(() => {
    async function fetchInvitation() {
      try {
        // Log the invite code for debugging
        console.log("[JoinPage] Fetching invitation:", inviteCode);
        
        // Query the database for the invitation details
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

        // Handle database query errors
        if (error) throw error;
        
        // Handle case where no invitation was found
        if (!data) {
          throw new Error('Invitation not found');
        }
        
        // Check if invitation has expired or already been accepted
        if (data.status === 'expired') {
          throw new Error('This invitation has expired');
        }
        
        if (data.status === 'accepted') {
          throw new Error('This invitation has already been used');
        }

        // Log successful invitation retrieval
        console.log("[JoinPage] Invitation found:", data);
        
        // Update the component state with the invitation details
        setInvitation(data as Invitation);
        
      } catch (err) {
        // Log and handle any errors
        console.error("[JoinPage] Error fetching invitation:", err);
        setError(err instanceof Error ? err.message : 'Failed to load invitation');
      } finally {
        // End the loading state
        setLoading(false);
      }
    }

    // Only fetch if we have an invite code
    if (inviteCode) {
      fetchInvitation();
    } else {
      // Handle case where no invite code was provided
      setError("No invitation code provided");
      setLoading(false);
    }
  }, [inviteCode]);

  // Handle successful neighborhood join
  const handleJoinComplete = () => {
    // Show success message
    toast({
      title: "Welcome!",
      description: `You've successfully joined. Let's meet your neighbors!`,
    });
    
    // Navigate to the neighbors page
    navigate('/neighbors');
  };

  // Handle the join neighborhood action
  const handleJoin = async () => {
    // Validate required data is present
    if (!user || !invitation) return;

    // Set joining state to show loading UI
    setJoining(true);
    try {
      // Check if the user is already a member of this neighborhood
      const { data: existingMember } = await supabase
        .from('neighborhood_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('neighborhood_id', invitation.neighborhood_id)
        .single();

      // If already a member, show message and redirect
      if (existingMember) {
        toast({
          title: "Already a member",
          description: "You are already a member of this neighborhood.",
        });
        navigate('/neighbors');
        return;
      }

      // Add the user as a neighborhood member
      const { error: memberError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: user.id,
          neighborhood_id: invitation.neighborhood_id,
          status: 'active'
        });

      // Handle errors in adding member
      if (memberError) throw memberError;

      // Update the invitation status to accepted
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // Handle errors in updating invitation
      if (inviteError) throw inviteError;

      // Complete the joining process
      handleJoinComplete();
      
    } catch (err) {
      // Log and handle any errors
      console.error("[JoinPage] Error joining neighborhood:", err);
      toast({
        title: "Error",
        description: "Failed to join neighborhood. Please try again.",
        variant: "destructive",
      });
    } finally {
      // End the joining state
      setJoining(false);
    }
  };

  // Show loading state while fetching invitation
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state if invitation is invalid or not found
  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-4">Invalid Invitation</h1>
          <p className="text-center text-gray-600 mb-4">
            {error || "This invitation link is invalid or has expired."}
          </p>
          <Button className="w-full" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  // Show the invitation acceptance UI
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">
          Join {invitation.neighborhoods.name}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          You've been invited to join this neighborhood community.
        </p>
        {!user ? (
          <div className="space-y-4">
            <Button className="w-full" onClick={() => navigate('/login')}>
              Sign in to join
            </Button>
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Create one
              </a>
            </p>
          </div>
        ) : (
          <Button 
            className="w-full"
            onClick={handleJoin}
            disabled={joining}
          >
            {joining ? "Joining..." : "Join Neighborhood"}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default JoinPage;
