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
 * Shows a neighborhood preview and guides users through signup/onboarding or direct join
 * 
 * UPDATED: Now properly routes new users to onboarding with comprehensive logging
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
   * Load neighborhood information from the invite code using security definer function
   * This bypasses RLS issues that prevent anonymous users from reading neighborhood data
   */
  useEffect(() => {
    const loadNeighborhoodFromInvite = async () => {
      console.log("[JoinPage] Starting neighborhood load process");
      console.log("[JoinPage] Invite code from URL:", inviteCode);
      console.log("[JoinPage] Current user:", user ? `${user.id} (${user.email})` : 'null');
      
      if (!inviteCode) {
        console.error("[JoinPage] No invite code found in URL");
        setError("Invalid invite link - no invite code found.");
        setIsLoading(false);
        return;
      }

      try {
        console.log("[JoinPage] Loading neighborhood using security definer function for invite code:", inviteCode);
        
        // Use the security definer function instead of direct table queries
        const { data: neighborhoodData, error: functionError } = await supabase
          .rpc('get_neighborhood_from_invite', { 
            invite_code_param: inviteCode 
          });

        if (functionError) {
          console.error("[JoinPage] Security definer function error:", functionError);
          setError("Unable to load neighborhood information.");
          setIsLoading(false);
          return;
        }

        // Check if we got results
        if (!neighborhoodData || neighborhoodData.length === 0) {
          console.error("[JoinPage] No neighborhood found for invite code");
          setError("This invite link is invalid or has expired.");
          setIsLoading(false);
          return;
        }

        const result = neighborhoodData[0];
        console.log("[JoinPage] Neighborhood data loaded:", result);

        // Check if invitation is still pending (not used)
        if (result.invitation_status !== 'pending') {
          console.error("[JoinPage] Invitation status is not pending:", result.invitation_status);
          setError("This invite link has already been used.");
          setIsLoading(false);
          return;
        }

        // Set the neighborhood preview data
        const neighborhoodPreview = {
          id: result.neighborhood_id,
          name: result.neighborhood_name,
          city: result.neighborhood_city,
          state: result.neighborhood_state,
          created_at: result.neighborhood_created_at,
          memberCount: result.member_count || 0
        };
        
        console.log("[JoinPage] Setting neighborhood preview:", neighborhoodPreview);
        setNeighborhood(neighborhoodPreview);

      } catch (error: any) {
        console.error("[JoinPage] Unexpected error:", error);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadNeighborhoodFromInvite();
  }, [inviteCode, user]);

  /**
   * Handle joining the neighborhood for existing authenticated users
   */
  const handleJoinNeighborhood = async () => {
    console.log("[JoinPage] handleJoinNeighborhood called");
    console.log("[JoinPage] User:", user ? `${user.id} (${user.email})` : 'null');
    console.log("[JoinPage] Neighborhood:", neighborhood?.id);
    console.log("[JoinPage] Invite code:", inviteCode);
    
    if (!user || !neighborhood || !inviteCode) {
      console.error("[JoinPage] Missing required data for joining", {
        hasUser: !!user,
        hasNeighborhood: !!neighborhood,
        hasInviteCode: !!inviteCode
      });
      return;
    }

    setIsJoining(true);
    try {
      console.log("[JoinPage] Checking if user is already a member");
      
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('neighborhood_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('neighborhood_id', neighborhood.id)
        .single();

      if (existingMember) {
        console.log("[JoinPage] User is already a member");
        toast.success("You're already a member of this neighborhood!");
        navigate('/');
        return;
      }

      console.log("[JoinPage] Adding user as neighborhood member");
      
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

      console.log("[JoinPage] Marking invitation as accepted");
      
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
      console.log("[JoinPage] Successfully joined neighborhood");
      toast.success(`Welcome to ${neighborhood.name}!`);
      navigate('/');

    } catch (error: any) {
      console.error("[JoinPage] Error joining neighborhood:", error);
      toast.error("Failed to join neighborhood. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  /**
   * Handle new user signup flow - FIXED to store invite code and go to onboarding
   * Store the invite code so they can auto-join after creating account and completing onboarding
   */
  const handleNewUserSignup = () => {
    console.log("[JoinPage] handleNewUserSignup called");
    console.log("[JoinPage] Invite code:", inviteCode);
    console.log("[JoinPage] Neighborhood:", neighborhood);
    
    // Store the invite code for the onboarding process to pick up
    if (inviteCode) {
      console.log("[JoinPage] Storing pending invite code for onboarding:", inviteCode);
      localStorage.setItem('pendingInviteCode', inviteCode);
    } else {
      console.error("[JoinPage] Missing invite code for guest onboarding");
    }
    
    // Navigate directly to onboarding where they can create account and complete profile
    console.log("[JoinPage] Navigating to /onboarding for guest signup flow");
    navigate('/onboarding');
  };

  // Loading state
  if (isLoading) {
    console.log("[JoinPage] Rendering loading state");
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
    console.log("[JoinPage] Rendering error state:", error);
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
  console.log("[JoinPage] Rendering main content");
  console.log("[JoinPage] User is authenticated:", !!user);
  console.log("[JoinPage] Neighborhood:", neighborhood?.name);
  
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
              // Existing user - can join directly
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
              // New user - goes to guest onboarding (FIXED)
              <div className="space-y-2">
                <Button 
                  onClick={handleNewUserSignup}
                  className="w-full"
                  size="lg"
                >
                  Join Neighborhood
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  You'll create an account and set up your profile to join
                </p>
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
