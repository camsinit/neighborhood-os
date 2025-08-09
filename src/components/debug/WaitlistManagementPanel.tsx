/**
 * WaitlistManagementPanel component
 * 
 * This component displays waitlist survey responses and provides functionality
 * for super admins to create neighborhoods from waitlist data and send admin invitations.
 */
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, MapPin, Star, Check, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useSuperAdminNeighborhoodCreation } from '@/hooks/useSuperAdminNeighborhoodCreation';
import { getTimezoneForState } from '@/utils/timezone';

// Type definition for waitlist survey response
interface WaitlistSurveyResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  neighborhood_name: string;
  city: string;
  state: string;
  neighbors_to_onboard: number;
  ai_coding_experience: string;
  open_source_interest: string;
  priority_score: number;
  created_at: string;
}

// Button state type for clarity
type ButtonState = 'create' | 'create-invite' | 'copy-invite';

interface WaitlistItemProps {
  response: WaitlistSurveyResponse;
  onNeighborhoodCreated: (neighborhoodId: string, response: WaitlistSurveyResponse) => void;
}

/**
 * Individual waitlist item component with creation and invitation functionality
 */
const WaitlistItem: React.FC<WaitlistItemProps> = ({ response, onNeighborhoodCreated }) => {
  const [createdNeighborhoodId, setCreatedNeighborhoodId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [buttonState, setButtonState] = useState<ButtonState>('create');
  const [isLoadingInitialState, setIsLoadingInitialState] = useState(true);
  
  const { createNeighborhood, createAdminInvitation, isCreating } = useSuperAdminNeighborhoodCreation();

  /**
   * Check on mount if a neighborhood and/or invitation already exists for this waitlist entry
   */
  useEffect(() => {
    const checkExistingState = async () => {
      try {
        console.log('[WaitlistItem] Checking existing state for:', response.neighborhood_name);
        
        // First, check if a neighborhood already exists with matching name, city, and state
        const { data: existingNeighborhoods, error: neighborhoodError } = await supabase
          .from('neighborhoods')
          .select('id')
          .eq('name', response.neighborhood_name)
          .eq('city', response.city)
          .eq('state', response.state);

        if (neighborhoodError) {
          console.error('[WaitlistItem] Error checking existing neighborhoods:', neighborhoodError);
          return;
        }

        // If we found a matching neighborhood
        if (existingNeighborhoods && existingNeighborhoods.length > 0) {
          const neighborhoodId = existingNeighborhoods[0].id;
          setCreatedNeighborhoodId(neighborhoodId);
          
          // Now check if an invitation exists for this email and neighborhood
          const { data: existingInvitations, error: invitationError } = await supabase
            .from('invitations')
            .select('invite_code')
            .eq('email', response.email)
            .eq('neighborhood_id', neighborhoodId)
            .eq('status', 'pending');

          if (invitationError) {
            console.error('[WaitlistItem] Error checking existing invitations:', invitationError);
            setButtonState('create-invite');
            return;
          }

          // If we found an invitation
          if (existingInvitations && existingInvitations.length > 0) {
            setInviteCode(existingInvitations[0].invite_code);
            setButtonState('copy-invite');
            console.log('[WaitlistItem] Found existing invitation:', existingInvitations[0].invite_code);
          } else {
            setButtonState('create-invite');
            console.log('[WaitlistItem] Neighborhood exists but no invitation found');
          }
        } else {
          setButtonState('create');
          console.log('[WaitlistItem] No existing neighborhood found');
        }
      } catch (error) {
        console.error('[WaitlistItem] Error checking existing state:', error);
        setButtonState('create'); // Default to create on error
      } finally {
        setIsLoadingInitialState(false);
      }
    };

    checkExistingState();
  }, [response.neighborhood_name, response.city, response.state, response.email]);

  /**
   * Creates a neighborhood and automatically generates admin invitation
   */
  const handleCreateNeighborhood = async () => {
    console.log('[WaitlistItem] Creating neighborhood for response:', response);
    setIsProcessing(true);
    
    try {
      // Create neighborhood data with automatically detected timezone based on state
      const neighborhoodData = {
        name: response.neighborhood_name,
        city: response.city,
        state: response.state,
        timezone: getTimezoneForState(response.state), // Automatically detect timezone based on state
        joinAsMember: false // Super admin creates as observer only for waitlist neighborhoods
      };

      const neighborhoodId = await createNeighborhood(neighborhoodData);
      
      if (neighborhoodId) {
        setCreatedNeighborhoodId(neighborhoodId);
        setButtonState('create-invite');
        onNeighborhoodCreated(neighborhoodId, response);
        console.log('[WaitlistItem] Neighborhood created successfully:', neighborhoodId);
        
        // Automatically create admin invitation
        const invitationMessage = `Hi ${response.first_name}! You've been selected to become the admin of ${response.neighborhood_name}. Welcome to your neighborhood!`;
        
        const invitationId = await createAdminInvitation(
          response.email,
          neighborhoodId,
          invitationMessage
        );

        if (invitationId) {
          // Fetch the invitation to get the invite code
          const { data: invitation, error } = await supabase
            .from('invitations')
            .select('invite_code')
            .eq('id', invitationId)
            .single();
            
          if (invitation && !error) {
            setInviteCode(invitation.invite_code);
            setButtonState('copy-invite');
            console.log('[WaitlistItem] Admin invitation created with code:', invitation.invite_code);
          }
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Creates just an admin invitation for an existing neighborhood
   */
  const handleCreateInvitation = async () => {
    if (!createdNeighborhoodId) {
      toast.error('No neighborhood found to create invitation for');
      return;
    }

    console.log('[WaitlistItem] Creating invitation for existing neighborhood:', createdNeighborhoodId);
    setIsProcessing(true);
    
    try {
      const invitationMessage = `Hi ${response.first_name}! You've been selected to become the admin of ${response.neighborhood_name}. Welcome to your neighborhood!`;
      
      const invitationId = await createAdminInvitation(
        response.email,
        createdNeighborhoodId,
        invitationMessage
      );

      if (invitationId) {
        // Fetch the invitation to get the invite code
        const { data: invitation, error } = await supabase
          .from('invitations')
          .select('invite_code')
          .eq('id', invitationId)
          .single();
          
        if (invitation && !error) {
          setInviteCode(invitation.invite_code);
          setButtonState('copy-invite');
          console.log('[WaitlistItem] Admin invitation created with code:', invitation.invite_code);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Copies the admin invitation link to clipboard
   */
  const handleCopyInviteLink = async () => {
    if (!inviteCode) {
      toast.error('No invite code available');
      return;
    }

    const inviteLink = `https://neighborhoodos.com/join/${inviteCode}`;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopySuccess(true);
      toast.success('Invite link copied to clipboard!');
      
      // Reset copy success indicator after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('[WaitlistItem] Failed to copy invite link:', error);
      toast.error('Failed to copy link to clipboard');
    }
  };

  /**
   * Resends the admin invitation email for an existing invite
   * - Useful when an invite already exists (button shows "Copy Invite") but we want to email it again
   * - We do NOT recreate the invite; we just send the email with the current invite link
   */
  const handleResendInvite = async () => {
    // Guard: we need an invite code to build the URL to include in the email
    if (!inviteCode) {
      toast.error('No invite code available to resend');
      return;
    }

    // Show a busy state while we perform the async call
    setIsProcessing(true);

    try {
      // Build a safe invite URL. We prefer the current origin (so it works in previews),
      // and fall back to production domain in non-browser contexts.
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://neighborhoodos.com';
      const inviteUrl = `${baseUrl}/join/${inviteCode}`;

      // Call the existing edge function that sends invitation emails via Resend
      // Note: This only sends the email; it doesn't change any DB state
      const { error } = await supabase.functions.invoke('send-invitation', {
        body: {
          recipientEmail: response.email,              // send to the waitlist responder
          inviterName: 'NeighborhoodOS',               // simple label since this is super-admin initiated
          neighborhoodName: response.neighborhood_name,// helps personalize the subject
          inviteUrl                                    // the unique link they can click to join
        }
      });

      if (error) {
        console.error('[WaitlistItem] Resend invite failed:', error);
        toast.error('Could not resend the invitation email. Please try again.');
        return;
      }

      // Happy path: confirm to the admin that the email was sent
      toast.success('Invitation email re-sent successfully!');
    } catch (err) {
      // Graceful degradation: show a friendly message without technical details
      console.error('[WaitlistItem] Unexpected error resending invite:', err);
      toast.error('Something went wrong while resending. You can still copy the link.');
    } finally {
      // Always clear the busy state
      setIsProcessing(false);
    }
  };

  return (
    <div className="border border-border bg-card rounded-lg p-3">
      {/* Compact header row with all key info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Name and email in compact form */}
          <div className="min-w-0">
            <div className="font-medium text-sm text-foreground truncate">
              {response.first_name} {response.last_name}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {response.email}
            </div>
          </div>
          
          {/* Location info */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{response.city}, {response.state}</span>
          </div>
          
          {/* Neighborhood name */}
          <div className="text-xs font-medium text-foreground truncate">
            "{response.neighborhood_name}"
          </div>
        </div>
        
        {/* Priority score */}
        <div className="flex items-center gap-1 shrink-0">
          <Star className="h-3 w-3 text-primary" />
          <span className="text-xs font-medium text-primary">{response.priority_score}</span>
        </div>
      </div>

      {/* Compact info row with badges and actions */}
      <div className="flex items-center justify-between gap-3">
        {/* Badges in horizontal layout */}
        <div className="flex gap-1 min-w-0 flex-1">
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 shrink-0">
            {response.neighbors_to_onboard} neighbors
          </Badge>
          <Badge variant="outline" className="text-xs px-1.5 py-0.5 shrink-0 truncate">
            {response.ai_coding_experience}
          </Badge>
          <Badge variant="outline" className="text-xs px-1.5 py-0.5 shrink-0 truncate">
            {response.open_source_interest}
          </Badge>
        </div>

        {/* Compact action button */}
        <div className="flex gap-1 shrink-0">
          {/* When an invite already exists, show a small Resend button to trigger an email re-send */}
          {buttonState === 'copy-invite' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleResendInvite}
              disabled={isLoadingInitialState || isProcessing || isCreating}
              className="h-7 px-2 text-xs"
              title="Send the invitation email again"
            >
              Resend
            </Button>
          )}

          <Button
            size="sm"
            variant={buttonState === 'copy-invite' ? "outline" : "default"}
            onClick={
              buttonState === 'create' ? handleCreateNeighborhood :
              buttonState === 'create-invite' ? handleCreateInvitation :
              handleCopyInviteLink
            }
            disabled={isLoadingInitialState || isProcessing || isCreating}
            className="h-7 px-2 text-xs"
          >
            {isLoadingInitialState ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Loading...
              </>
            ) : isProcessing || isCreating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                {buttonState === 'create' ? 'Creating...' : 'Inviting...'}
              </>
            ) : buttonState === 'copy-invite' ? (
              copySuccess ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Invite
                </>
              )
            ) : buttonState === 'create-invite' ? (
              <>
                <UserPlus className="h-3 w-3 mr-1" />
                Create Invite
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3 mr-1" />
                Create
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main WaitlistManagementPanel component
 */
export const WaitlistManagementPanel: React.FC = () => {
  const [processedResponses, setProcessedResponses] = useState<Set<string>>(new Set());

  // Fetch waitlist survey responses sorted by priority score
  const { data: waitlistResponses, isLoading, error } = useQuery({
    queryKey: ['waitlist-survey-responses'],
    queryFn: async (): Promise<WaitlistSurveyResponse[]> => {
      console.log('[WaitlistManagementPanel] Fetching waitlist survey responses');
      
      const { data, error } = await supabase
        .from('waitlist_survey_responses')
        .select('*')
        .order('priority_score', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[WaitlistManagementPanel] Error fetching waitlist responses:', error);
        throw error;
      }

      console.log('[WaitlistManagementPanel] Fetched waitlist responses:', data);
      return data || [];
    }
  });

  /**
   * Handles when a neighborhood is successfully created from waitlist data
   */
  const handleNeighborhoodCreated = (neighborhoodId: string, response: WaitlistSurveyResponse) => {
    setProcessedResponses(prev => new Set([...prev, response.id]));
    console.log('[WaitlistManagementPanel] Neighborhood created for response:', response.id, neighborhoodId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading waitlist responses...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            Error loading waitlist responses: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalResponses = waitlistResponses?.length || 0;
  const processedCount = processedResponses.size;

  return (
    <Card>
      <CardContent className="space-y-4 pt-[25px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Waitlist Management</h3>
          <p className="text-sm text-muted-foreground">
            Create neighborhoods from waitlist responses and invite admins
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-foreground">{totalResponses} total responses</div>
          <div className="text-xs text-muted-foreground">{processedCount} processed</div>
        </div>
      </div>

      {/* Waitlist Items */}
      {totalResponses === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No waitlist responses found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {waitlistResponses.map((response) => (
            <WaitlistItem
              key={response.id}
              response={response}
              onNeighborhoodCreated={handleNeighborhoodCreated}
            />
          ))}
        </div>
      )}
      </CardContent>
    </Card>
  );
};