
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading";
import { useUser } from "@supabase/auth-helpers-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define the shape of our invitation data
interface Invitation {
  id: string;
  neighborhood_id: string;
  neighborhoods: {
    name: string;
  };
  inviter_id: string;
  status: 'pending' | 'accepted' | 'expired';
}

const JoinPage = () => {
  const { inviteCode } = useParams();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();

  // Fetch the invitation details
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
    }
  }, [inviteCode]);

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
          <Button className="w-full" onClick={() => window.location.href = "/"}>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  // For now, just show the invitation details
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
            <Button className="w-full" onClick={() => window.location.href = "/login"}>
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
            onClick={async () => {
              // We'll implement this in the next step
              console.log("Join functionality coming soon");
            }}
          >
            Join Neighborhood
          </Button>
        )}
      </Card>
    </div>
  );
};

export default JoinPage;
