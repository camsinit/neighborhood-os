

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { BasicInvitationEmail } from './_templates/basic-invitation.tsx'
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Initialize clients
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendApiKey = Deno.env.get('RESEND_API_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Create a logger for this function
const logger = createLogger('send-invitation');

/**
 * Unified Email Parameter Resolution for Actor-Recipient Emails
 * Handles relationship-aware messaging: "Your neighbor Sarah invited you"
 */

// Resolve user display name for relationship context
function resolveActorDisplayName(profile: any, email: string, isActor: boolean = true): string {
  const baseName = profile?.display_name || profile?.first_name || extractNameFromEmail(email);
  
  // For invitations, just return the actor's name without "Your neighbor" prefix
  return baseName;
}

// Extract name from email with proper formatting
function extractNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  const cleanName = localPart
    .replace(/[._+-]/g, ' ')
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
  
  return cleanName || 'Neighbor';
}

// Generate invitation URLs with proper tracking
function generateInvitationUrls(baseUrl: string, inviterId?: string, neighborhoodId?: string) {
  const addTracking = (url: string, content?: string) => {
    const urlObj = new URL(url, baseUrl);
    urlObj.searchParams.set('utm_source', 'email');
    urlObj.searchParams.set('utm_medium', 'email');  
    urlObj.searchParams.set('utm_campaign', 'invitation_email');
    if (content) urlObj.searchParams.set('utm_content', content);
    if (inviterId) urlObj.searchParams.set('utm_term', `inviter_${inviterId}`);
    return urlObj.toString();
  };

  return {
    dashboardUrl: addTracking('/dashboard', 'invitation_dashboard'),
    skillsUrl: addTracking('/skills', 'invitation_skills'),
    neighborhoodUrl: neighborhoodId ? addTracking(`/neighborhood/${neighborhoodId}`, 'invitation_neighborhood') : null,
  };
}

interface InvitationRequest {
  recipientEmail: string
  inviterName?: string          // Optional - will resolve from database
  neighborhoodName?: string     // Optional - will resolve from database
  inviteUrl: string
  inviterId?: string           // For better personalization
  neighborhoodId?: string      // For neighborhood context
  personalMessage?: string      // Optional personal note from inviter
}

/**
 * Enhanced send invitation function with unified parameter system
 * Automatically resolves relationship-aware messaging and consistent branding
 */
serve(async (req) => {
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body to get invitation details
    const requestData = await req.json()
    const { 
      recipientEmail, 
      inviterName, 
      neighborhoodName, 
      inviteUrl,
      inviterId,
      neighborhoodId,
      personalMessage
    }: InvitationRequest = requestData

    // Validate required fields
    if (!recipientEmail || !inviteUrl) {
      logger.error("Missing required fields in request");
      return errorResponse("Missing required fields: recipientEmail, inviteUrl", 400);
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      logger.error("Invalid email format provided");
      return errorResponse("Invalid email format", 400);
    }

    // Resolve inviter profile and neighborhood for relationship-aware messaging
    let inviterProfile = null;
    let resolvedNeighborhoodName = neighborhoodName || 'your neighborhood';
    let neighborhoodDescription = null;
    
    if (inviterId) {
      try {
        // Get inviter profile for name resolution  
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, first_name, bio, avatar_url')
          .eq('id', inviterId)
          .single();
          
        inviterProfile = profileData;
        logger.info(`Resolved inviter profile for ${inviterId}`);
      } catch (error) {
        logger.warn(`Could not resolve inviter profile for ${inviterId}:`, error);
      }
    }
    
    if (neighborhoodId) {
      try {
        // Get neighborhood details for better context
        const { data: neighborhoodData } = await supabase
          .from('neighborhoods')
          .select('name, city, state')
          .eq('id', neighborhoodId)
          .single();
          
        if (neighborhoodData) {
          resolvedNeighborhoodName = neighborhoodData.name;
          if (neighborhoodData.city && neighborhoodData.state) {
            neighborhoodDescription = `A neighborhood community in ${neighborhoodData.city}, ${neighborhoodData.state}`;
          }
        }
        
        logger.info(`Resolved neighborhood: ${resolvedNeighborhoodName}`);
      } catch (error) {
        logger.warn(`Could not resolve neighborhood for ${neighborhoodId}:`, error);
      }
    }

    // Use unified relationship-aware name resolution
    const actorName = inviterName || resolveActorDisplayName(inviterProfile, inviterId ? `inviter-${inviterId}@example.com` : 'unknown@example.com', true);
    
    // Generate URLs with consistent tracking
    const baseUrl = "https://neighborhoodos.com";
    const { dashboardUrl } = generateInvitationUrls(baseUrl, inviterId, neighborhoodId);

    logger.info(`Sending invitation from "${actorName}" to ${recipientEmail} for ${resolvedNeighborhoodName}`);

    // Prepare email parameters using unified actor-recipient system
    const emailParams = {
      // Unified base properties
      recipientName: 'neighbor',  // Generic for invitations since we don't know them yet
      neighborhoodName: resolvedNeighborhoodName,
      fromName: 'neighborhoodOS',
      homeUrl: dashboardUrl,
      
      // Actor-recipient properties
      actorName,                              // "Your neighbor Sarah"
      actorAvatarUrl: null,                   // Could be added later
      actionDescription: 'invited you to join',
      contentTitle: resolvedNeighborhoodName,
      primaryCtaText: `Join ${resolvedNeighborhoodName}`,
      primaryCtaUrl: inviteUrl,               // This is the actual invitation acceptance URL
      
      // Invitation-specific properties
      inviteUrl,                              // Backwards compatibility
      personalMessage,                        // Optional personal note
      neighborhoodDescription,                // Additional context about the neighborhood
    };

    // Render the email template with unified parameters
    const emailHtml = await renderAsync(
      React.createElement(BasicInvitationEmail, {
        inviterName: actorName,
        neighborhoodName: resolvedNeighborhoodName,
        inviteUrl,
        inviterAvatarUrl: inviterProfile?.avatar_url,
      })
    )

    // Send the email via Resend using consistent from address and subject
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'neighborhoodOS <hello@updates.neighborhoodos.com>',
        to: [recipientEmail],
        subject: `${actorName} invited you to join ${resolvedNeighborhoodName}`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      logger.error('Resend API error:', errorData);
      throw new Error(`Resend API error: ${errorData.message || 'Unknown error'}`)
    }

    const emailData = await emailResponse.json()
    logger.info(`Invitation email sent successfully to: ${recipientEmail}`, emailData);

    return successResponse(
      { 
        emailId: emailData.data?.id,
        resolvedData: {
          actorName,
          neighborhoodName: resolvedNeighborhoodName,
          personalMessage: !!personalMessage,
        }
      }, 
      'Invitation sent successfully'
    );

  } catch (error: any) {
    logger.error('Error sending invitation email:', error);
    return errorResponse(`Failed to send invitation email: ${error.message}`);
  }
})

