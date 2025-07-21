

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

interface InvitationRequest {
  recipientEmail: string
  inviterName: string
  neighborhoodName: string
  inviteUrl: string
}

/**
 * Send invitation email to a new neighbor
 * This function renders the basic invitation template and sends it via Resend
 */
serve(async (req) => {
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body to get invitation details
    const requestData = await req.json()
    const { recipientEmail, inviterName, neighborhoodName, inviteUrl }: InvitationRequest = requestData

    // Validate required fields
    if (!recipientEmail || !inviterName || !neighborhoodName || !inviteUrl) {
      logger.error("Missing required fields in request");
      return errorResponse("Missing required fields: recipientEmail, inviterName, neighborhoodName, inviteUrl", 400);
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      logger.error("Invalid email format provided");
      return errorResponse("Invalid email format", 400);
    }

    logger.info(`Sending invitation from ${inviterName} to ${recipientEmail} for ${neighborhoodName}`);

    // Render the email template
    const emailHtml = await renderAsync(
      React.createElement(BasicInvitationEmail, {
        inviterName,
        neighborhoodName,
        inviteUrl
      })
    )

    // Send the email via Resend using the verified domain
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'neighborhoodOS <hello@updates.neighborhoodos.com>',
        to: [recipientEmail],
        subject: `${inviterName} invited you to join ${neighborhoodName}`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      logger.error('Resend API error:', errorData);
      throw new Error(`Resend API error: ${errorData.message || 'Unknown error'}`)
    }

    const emailData = await emailResponse.json()
    logger.info(`Invitation email sent successfully to: ${recipientEmail}`);

    return successResponse(
      { emailId: emailData.data?.id }, 
      'Invitation sent successfully'
    );

  } catch (error: any) {
    logger.error('Error sending invitation email:', error);
    return errorResponse('Failed to send invitation email');
  }
})

