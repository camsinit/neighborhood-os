
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading";
import { useUser } from "@supabase/auth-helpers-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  // Get the invite code from URL parameters
  const { inviteCode } = useParams();
  // Track the invitation data
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  // Track loading state
  const [loading, setLoading] = useState(true);
  // Track joining process state
  const [joining, setJoining] = useState(false);
  // Track any errors that occur
  const [error, setError] = useState<string | null>(null);
  // Get current user
  const user = useUser();
  // Get toast functionality for notifications
  const { toast } = useToast();
  // Get navigation functionality
  const navigate = useNavigate();
  // Get current location to understand what URL we're on
  const location = useLocation();

  // Debug the current URL and parameters
  useEffect(() => {
    console.log("[JoinPage] Render with:", {
      path: location.pathname,
      inviteCode,
      hasUser: !!user
    });
  }, [location.pathname, inviteCode, user]);

  // Effect to fetch invitation data when component mounts
  useEffect(() => {
    async function fetchInvitation() {
      try {
        // Clear any previous errors
        setError(null);
        
        // If no invite code, show appropriate message for the join landing page
        if (!inviteCode) {
          console.log("[JoinPage] No invitation code in URL - this is the join landing page");
          setInvitation(null);
          setLoading(false);
          return;
        }
        
        console.log("[JoinPage] Fetching invitation:", inviteCode);
        
        // Query the database for the invitation
        const { data, error: fetchError } = await supabase
          .from('invitations')
          .select(`
            *,
            neighborhoods (
              name
            )
          `)
          .eq('invite_code', inviteCode)
          .single();

        // If there was a database error, throw it
        if (fetchError) {
          console.error("[JoinPage] Database error fetching invitation:", fetchError);
          throw new Error(`Error fetching invitation: ${fetchError.message}`);
        }
        
        // If no data was returned, the invitation doesn't exist
        if (!data) {
          console.log("[JoinPage] No invitation found for code:", inviteCode);
          throw new Error('Invitation not found');
        }
        
        // Check if invitation is expired
        if (data.status === 'expired') {
          console.log("[JoinPage] Invitation expired:", data);
          throw new Error('This invitation has expired');
        }
        
        // Check if invitation is already used
        if (data.status === 'accepted') {
          console.log("[JoinPage] Invitation already used:", data);
          throw new Error('This invitation has already been used');
        }
        
        console.log("[JoinPage] Invitation found:", data);
        setInvitation(data as Invitation);
      } catch (err) {
        console.error("[JoinPage] Error in invitation process:", err);
        setError(err instanceof Error ? err.message : 'Failed to load invitation');
      } finally {
        setLoading(false);
      }
    }

    // Fetch invitation if we're on a join page with a code
    if (inviteCode) {
      fetchInvitation();
    } else {
      // If we're just on /join with no code, show the join landing page
      console.log("[JoinPage] On /join with no code - showing join landing page");
      setLoading(false);
    }
  }, [inviteCode]);

  // Function to handle completion of join process
  const handleJoinComplete = () => {
    toast({
      title: "Welcome!",
      description: `You've successfully joined. Let's meet your neighbors!`,
    });
    navigate('/neighbors');
  };

  // Function to handle the join button click
  const handleJoin = async () => {
    // Safety checks
    if (!user || !invitation) return;
    
    setJoining(true);
    try {
      // Check if already a member of this neighborhood
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('neighborhood_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('neighborhood_id', invitation.neighborhood_id)
        .single();
        
      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        // If error is not "no rows returned" then it's a real error
        console.error("[JoinPage] Error checking membership:", memberCheckError);
        throw new Error(`Could not verify existing membership: ${memberCheckError.message}`);
      }
      
      // If already a member, show message and navigate
      if (existingMember) {
        toast({
          title: "Already a member",
          description: "You are already a member of this neighborhood.",
        });
        navigate('/neighbors');
        return;
      }
      
      // Add the user to neighborhood members
      const { error: memberError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: user.id,
          neighborhood_id: invitation.neighborhood_id,
          status: 'active'
        });
        
      if (memberError) {
        console.error("[JoinPage] Error adding member:", memberError);
        throw memberError;
      }
      
      // Update invitation status to accepted
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);
        
      if (inviteError) {
        console.error("[JoinPage] Error updating invitation:", inviteError);
        throw inviteError;
      }
      
      // Complete the join process
      handleJoinComplete();
    } catch (err) {
      console.error("[JoinPage] Error joining neighborhood:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to join neighborhood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  // Show loading spinner while loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If we're on the join page without an invite code, show the join landing page
  if (!inviteCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-4">Join a Neighborhood</h1>
          <p className="text-center text-gray-600 mb-4">
            To join a neighborhood, you need an invitation link from an existing member.
          </p>
          {!user ? (
            <div className="space-y-4">
              <Button className="w-full" onClick={() => navigate('/login')}>
                Sign in first
              </Button>
              <p className="text-center text-sm text-gray-500">
                You'll need to sign in before you can join a neighborhood.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-amber-600">
                Please use an invitation link to join a neighborhood.
              </p>
              <Button className="w-full" onClick={() => navigate('/')}>
                Go Home
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Show error message if there is an error with the invitation
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

  // Show join UI if everything is valid
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
