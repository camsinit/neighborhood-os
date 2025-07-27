/**
 * WaitlistManagementPanel component
 * 
 * This component displays waitlist survey responses and provides functionality
 * for super admins to create neighborhoods from waitlist data and send admin invitations.
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, Mail, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useSuperAdminNeighborhoodCreation } from '@/hooks/useSuperAdminNeighborhoodCreation';

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

interface WaitlistItemProps {
  response: WaitlistSurveyResponse;
  onNeighborhoodCreated: (neighborhoodId: string, response: WaitlistSurveyResponse) => void;
}

/**
 * Individual waitlist item component with creation and invitation functionality
 */
const WaitlistItem: React.FC<WaitlistItemProps> = ({ response, onNeighborhoodCreated }) => {
  const [createdNeighborhoodId, setCreatedNeighborhoodId] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  
  const { createNeighborhood, createAdminInvitation, isCreating } = useSuperAdminNeighborhoodCreation();

  /**
   * Creates a neighborhood from the waitlist response data
   */
  const handleCreateNeighborhood = async () => {
    console.log('[WaitlistItem] Creating neighborhood for response:', response);
    
    const neighborhoodData = {
      name: response.neighborhood_name,
      city: response.city,
      state: response.state,
      timezone: 'America/Los_Angeles', // Default timezone
      joinAsMember: false // Super admin creates as observer only for waitlist neighborhoods
    };

    const neighborhoodId = await createNeighborhood(neighborhoodData);
    
    if (neighborhoodId) {
      setCreatedNeighborhoodId(neighborhoodId);
      onNeighborhoodCreated(neighborhoodId, response);
      console.log('[WaitlistItem] Neighborhood created successfully:', neighborhoodId);
    }
  };

  /**
   * Sends admin invitation to the waitlist respondent
   */
  const handleSendAdminInvitation = async () => {
    if (!createdNeighborhoodId) {
      toast.error('Please create the neighborhood first before sending invitation.');
      return;
    }

    setIsInviting(true);
    
    try {
      const invitationMessage = `Hi ${response.first_name}! You've been selected to become the admin of ${response.neighborhood_name}. Welcome to your neighborhood!`;
      
      const invitationId = await createAdminInvitation(
        response.email,
        createdNeighborhoodId,
        invitationMessage
      );

      if (invitationId) {
        console.log('[WaitlistItem] Admin invitation sent successfully:', invitationId);
      }
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-foreground">
              {response.first_name} {response.last_name}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {response.email}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">{response.priority_score}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Neighborhood Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{response.neighborhood_name}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {response.city}, {response.state}
          </div>
        </div>

        {/* Response Details */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {response.neighbors_to_onboard} neighbors
          </Badge>
          <Badge variant="outline" className="text-xs">
            {response.ai_coding_experience}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {response.open_source_interest}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="default"
            onClick={handleCreateNeighborhood}
            disabled={isCreating || createdNeighborhoodId !== null}
            className="flex-1"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Creating...
              </>
            ) : createdNeighborhoodId ? (
              <>
                <UserPlus className="h-3 w-3 mr-1" />
                Created ✓
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3 mr-1" />
                Create Neighborhood
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleSendAdminInvitation}
            disabled={!createdNeighborhoodId || isInviting}
            className="flex-1"
          >
            {isInviting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <Mail className="h-3 w-3 mr-1" />
                Send Admin Invite
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
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
    <div className="space-y-4">
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
        <div className="space-y-3">
          {waitlistResponses.map((response) => (
            <WaitlistItem
              key={response.id}
              response={response}
              onNeighborhoodCreated={handleNeighborhoodCreated}
            />
          ))}
        </div>
      )}
    </div>
  );
};