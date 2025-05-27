
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';

/**
 * Interface for neighborhood preview data
 */
interface NeighborhoodPreview {
  id: string;
  name: string;
  city?: string;
  state?: string;
  created_at: string;
  memberCount: number;
}

/**
 * JoinPage Component
 * 
 * Handles the standardized join flow using the URL pattern: /join/{inviteCode}
 * Shows a neighborhood preview before allowing users to join
 */
const JoinPage = () => {
  // Get the invite code from the URL params
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const user = useUser();
  
  // Component state
  const [neighborhood, setNeighborhood] = useState<NeighborhoodPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load neighborhood information from the invite code
   */
  useEffect(() => {
    const loadNeighborhoodFromInvite = async () => {
      if (!inviteCode) {
        setError("Invalid invite link - no invite code found.");
        setIsLoading(false);
        return;
      }

      try {
        console.log("[JoinPage] Loading neighborhood for invite code:", inviteCode);
        
        // First, verify the invitation exists and get the neighborhood ID
        const { data: invitation, error: inviteError } = await supabase
          .from('invitations')
          .select('neighborhood_id, status')
          .eq('invite_code', inviteCode)
          .single();

        if (inviteError || !invitation) {
          console.error("[JoinPage] Invalid invite code:", inviteError);
          setError("This invite link is invalid or has expired.");
          setIsLoading(false);
          return;
        }

        // Check if invitation is still pending (not used)
        if (invitation.status !== 'pending') {
          setError("This invite link has already been used.");
          setIsLoading(false);
          return;
        }

        // Get neighborhood details
        const { data: neighborhoodData, error: neighborhoodError } = await supabase
          .from('neighborhoods')
          .select('id, name, city, state, created_at')
          .eq('id', invitation.neighborhood_id)
          .single();

        if (neighborhoodError || !neighborhoodData) {
          console.error("[JoinPage] Error loading neighborhood:", neighborhoodError);
          setError("Unable to load neighborhood information.");
          setIsLoading(false);
          return;
        }

        // Get member count
        const { count: memberCount } = await supabase
          .from('neighborhood_members')
          .select('*', { count: 'exact', head: true })
          .eq('neighborhood_id', invitation.neighborhood_id)
          .eq('status', 'active');

        // Set the neighborhood preview data
        setNeighborhood({
          ...neighborhoodData,
          memberCount: memberCount || 0
        });

      } catch (error: any) {
        console.error("[JoinPage] Unexpected error:", error);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadNeighborhoodFromInvite();
  }, [inviteCode]);

  /**
   * Handle joining the neighborhood
   */
  const handleJoinNeighborhood = async () => {
    if (!user || !neighborhood || !inviteCode) {
      if (!user) {
        toast.error("Please log in to join a neighborhood.");
        navigate('/login');
      }
      return;
    }

    setIsJoining(true);
    try {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('neighborhood_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('neighborhood_id', neighborhood.id)
        .single();

      if (existingMember) {
        toast.success("You're already a member of this neighborhood!");
        navigate('/');
        return;
      }

      // Add user as a neighborhood member
      const { error: memberError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: user.id,
          neighborhood_id: neighborhood.id,
          status: 'active'
        });

      if (memberError) {
        throw memberError;
      }

      // Mark the invitation as accepted
      const { error: inviteError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('invite_code', inviteCode);

      if (inviteError) {
        console.warn("[JoinPage] Failed to update invitation status:", inviteError);
        // Don't fail the join process for this
      }

      // Success!
      toast.success(`Welcome to ${neighborhood.name}!`);
      navigate('/');

    } catch (error: any) {
      console.error("[JoinPage] Error joining neighborhood:", error);
      toast.error("Failed to join neighborhood. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading neighborhood information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Invite Not Found</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/')} variant="outline">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main join page content
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Join {neighborhood?.name}</CardTitle>
          <CardDescription>
            You've been invited to join this neighborhood community
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Neighborhood Preview Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span>
                {neighborhood?.city && neighborhood?.state 
                  ? `${neighborhood.city}, ${neighborhood.state}`
                  : 'Location not specified'
                }
              </span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600">
              <Users className="h-5 w-5" />
              <span>{neighborhood?.memberCount || 0} members</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600">
              <Calendar className="h-5 w-5" />
              <span>
                Created {neighborhood?.created_at 
                  ? new Date(neighborhood.created_at).toLocaleDateString()
                  : 'recently'
                }
              </span>
            </div>
          </div>

          {/* Join Button */}
          <div className="space-y-3">
            {user ? (
              <Button 
                onClick={handleJoinNeighborhood}
                disabled={isJoining}
                className="w-full"
                size="lg"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {isJoining ? 'Joining...' : `Join ${neighborhood?.name}`}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">
                  You need to log in to join this neighborhood
                </p>
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full"
                  size="lg"
                >
                  Log In to Join
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By joining, you'll be able to connect with your neighbors and participate in community activities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinPage;
