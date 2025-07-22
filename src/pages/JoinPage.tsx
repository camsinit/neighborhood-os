
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';

/**
 * Interface for neighborhood preview data from the invite function
 */
interface NeighborhoodPreview {
  id: string;
  name: string;
  city?: string;
  state?: string;
  created_at: string;
  memberCount: number;
  inviterDisplayName: string;
  inviterAvatarUrl?: string;
  inviteHeaderImageUrl?: string;
}

/**
 * JoinPage Component
 * 
 * Handles the standardized join flow using the URL pattern: /join/{inviteCode}
 * Shows a neighborhood preview and guides users through signup/onboarding or direct join
 * 
 * UPDATED: Now properly stores invite code and routes new users to onboarding with better logging
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
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Check for OAuth errors in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam === 'oauth_failed') {
      setOauthError('Google sign-in failed. Please try the manual signup option or try again.');
    }
  }, []);

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

        // Check if invitation is still pending
        if (result.invitation_status !== 'pending') {
          console.error("[JoinPage] Invitation status is not pending:", result.invitation_status);
          setError("This invite link has already been used.");
          setIsLoading(false);
          return;
        }

        // Set the neighborhood preview data with inviter information
        const neighborhoodPreview = {
          id: result.neighborhood_id,
          name: result.neighborhood_name,
          city: result.neighborhood_city,
          state: result.neighborhood_state,
          created_at: result.neighborhood_created_at,
          memberCount: result.member_count || 0,
          inviterDisplayName: result.inviter_display_name,
          inviterAvatarUrl: result.inviter_avatar_url,
          inviteHeaderImageUrl: result.invite_header_image_url
        };
        
        console.log("[JoinPage] Setting neighborhood preview:", neighborhoodPreview);
        setNeighborhood(neighborhoodPreview);
        setIsLoading(false);

      } catch (error: any) {
        console.error("[JoinPage] Unexpected error:", error);
        setError("An unexpected error occurred. Please try again.");
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
      
      // Get invitation details to notify inviter and admin
      const { data: inviteData } = await supabase
        .from('invitations')
        .select(`
          inviter_id,
          neighborhood_id,
          neighborhoods:neighborhood_id (created_by)
        `)
        .eq('invite_code', inviteCode)
        .single();
      
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

      // Send invitation accepted notifications
      if (inviteData) {
        try {
          // Get user profile for name
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single();

          const accepterName = profileData?.display_name || user.email?.split('@')[0] || 'A neighbor';

          // Get emails of people to notify (inviter and admin if different)
          const emailsToNotify = new Set<string>();
          
          // Get inviter email
          const { data: inviterProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', inviteData.inviter_id)
            .single();
            
          if (inviterProfile) {
            const { data: inviterAuth } = await supabase.auth.admin.getUserById(inviteData.inviter_id);
            if (inviterAuth.user?.email) {
              emailsToNotify.add(inviterAuth.user.email);
            }
          }

          // Get admin email if different from inviter
          const adminId = (inviteData.neighborhoods as any)?.created_by;
          if (adminId && adminId !== inviteData.inviter_id) {
            const { data: adminAuth } = await supabase.auth.admin.getUserById(adminId);
            if (adminAuth.user?.email) {
              emailsToNotify.add(adminAuth.user.email);
            }
          }

          // Send notification emails
          if (emailsToNotify.size > 0) {
            await supabase.functions.invoke('send-invitation-accepted', {
              body: {
                recipientEmails: Array.from(emailsToNotify),
                accepterName,
                neighborhoodName: neighborhood.name,
                isAdminNotification: false // Will be handled by the function
              }
            });
          }
        } catch (emailError) {
          console.warn("[JoinPage] Failed to send invitation accepted emails:", emailError);
          // Don't fail the join process for email errors
        }
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
   * Handle Google OAuth signup flow - Store invite code and start OAuth
   */
  const handleGoogleSignup = async () => {
    console.log("[JoinPage] handleGoogleSignup called");
    console.log("[JoinPage] Invite code:", inviteCode);
    console.log("[JoinPage] Neighborhood:", neighborhood?.name);
    
    // Store the invite code for after OAuth completion
    if (inviteCode) {
      console.log("[JoinPage] Storing pending invite code for OAuth flow:", inviteCode);
      localStorage.setItem('pendingInviteCode', inviteCode);
    } else {
      console.error("[JoinPage] Missing invite code for OAuth signup");
    }
    
    // Store OAuth destination for callback processing
    localStorage.setItem('oauthDestination', 'onboarding');
    
    try {
      console.log("[JoinPage] Starting Google OAuth signup");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error("[JoinPage] Google OAuth error:", error);
        toast.error("Failed to connect with Google. Please try again.");
        return;
      }

      console.log("[JoinPage] Google OAuth initiated successfully");
      // User will be redirected after OAuth completion
      
    } catch (error: any) {
      console.error("[JoinPage] Error during Google OAuth:", error);
      toast.error("Failed to connect with Google. Please try again.");
    }
  };

  /**
   * Handle manual signup flow - Store invite code and go to onboarding
   */
  const handleManualSignup = () => {
    console.log("[JoinPage] handleManualSignup called");
    console.log("[JoinPage] Invite code:", inviteCode);
    console.log("[JoinPage] Neighborhood:", neighborhood?.name);
    
    // Store the invite code for the onboarding process to pick up
    if (inviteCode) {
      console.log("[JoinPage] Storing pending invite code for manual onboarding:", inviteCode);
      localStorage.setItem('pendingInviteCode', inviteCode);
    } else {
      console.error("[JoinPage] Missing invite code for manual onboarding");
    }
    
    // Navigate directly to onboarding where they can create account and complete profile
    console.log("[JoinPage] Navigating to /onboarding for manual signup flow");
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
        {/* Header Image - renders above the card content if available */}
        {neighborhood?.inviteHeaderImageUrl && (
          <div className="w-full h-32 overflow-hidden rounded-t-lg">
            <img 
              src={neighborhood.inviteHeaderImageUrl} 
              alt="Neighborhood invite header"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader className="text-center">
          {/* Inviter's Profile Image or Default Icon */}
          <div className="mx-auto mb-4 w-fit">
            {neighborhood?.inviterAvatarUrl ? (
              <img 
                src={neighborhood.inviterAvatarUrl} 
                alt={`${neighborhood.inviterDisplayName}'s profile`}
                className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-lg"
              />
            ) : (
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl">
            Join us on{' '}
            <a 
              href="https://neighborhoodos.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              neighborhoodOS
            </a>
          </CardTitle>
          
          <CardDescription>
            {neighborhood?.inviterDisplayName && neighborhood?.name ? (
              <>
                {neighborhood.inviterDisplayName} invited you to join the {neighborhood.name} neighborhood.
              </>
            ) : (
              'You\'ve been invited to join this neighborhood community'
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* OAuth Error Display */}
          {oauthError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{oauthError}</p>
            </div>
          )}
          
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
              // New user - OAuth-first signup flow
              <div className="space-y-4">
                {/* Primary: Google OAuth Button */}
                <Button 
                  onClick={handleGoogleSignup}
                  className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  size="lg"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Create your neighbor profile
                </Button>
                
                <div className="text-center">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                </div>
                
                {/* Secondary: Manual Signup */}
                <Button 
                  onClick={handleManualSignup}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Manual Sign-up Flow
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinPage;
