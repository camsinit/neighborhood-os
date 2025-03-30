
import { useParams, useNavigate } from "react-router-dom";
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
  const { inviteCode } = useParams();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInvitation() {
      try {
        console.log("[JoinPage] Fetching invitation:", inviteCode);
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
        console.log("[JoinPage] Invitation found:", data);
        setInvitation(data as Invitation);
      } catch (err) {
        console.error("[JoinPage] Error fetching invitation:", err);
        setError(err instanceof Error ? err.message : 'Failed to load invitation');
      } finally {
        setLoading(false);
      }
    }

    if (inviteCode) {
      fetchInvitation();
    } else {
      setError("No invitation code provided");
      setLoading(false);
    }
  }, [inviteCode]);

  const handleJoinComplete = () => {
    toast({
      title: "Welcome!",
      description: `You've successfully joined. Let's meet your neighbors!`,
    });
    navigate('/neighbors');
  };

  const handleJoin = async () => {
    if (!user || !invitation) return;
    setJoining(true);
    try {
      const { data: existingMember } = await supabase
        .from('neighborhood_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('neighborhood_id', invitation.neighborhood_id)
        .single();
      if (existingMember) {
        toast({
          title: "Already a member",
          description: "You are already a member of this neighborhood.",
        });
        navigate('/neighbors');
        return;
      }
      const { error: memberError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: user.id,
          neighborhood_id: invitation.neighborhood_id,
          status: 'active'
        });
      if (memberError) throw memberError;
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);
      if (inviteError) throw inviteError;
      handleJoinComplete();
    } catch (err) {
      console.error("[JoinPage] Error joining neighborhood:", err);
      toast({
        title: "Error",
        description: "Failed to join neighborhood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

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
