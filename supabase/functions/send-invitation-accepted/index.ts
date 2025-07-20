
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { InvitationAcceptedEmail } from './_templates/invitation-accepted.tsx';
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Initialize Resend with API key from environment
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Create a logger for this function
const logger = createLogger('send-invitation-accepted');

/**
 * Interface for invitation accepted notification request
 */
interface InvitationAcceptedRequest {
  recipientEmails: string[]; // Array of emails to notify (inviter and admin)
  accepterName: string;
  neighborhoodName: string;
  isAdminNotification: boolean; // Differentiates between inviter and admin notification
}

/**
 * Edge function to send invitation accepted notifications
 * Notifies both the person who sent the invite and the neighborhood admin
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body
    const { 
      recipientEmails, 
      accepterName, 
      neighborhoodName,
      isAdminNotification
    }: InvitationAcceptedRequest = await req.json();

    // Validate required fields
    if (!recipientEmails || !recipientEmails.length || !accepterName || !neighborhoodName) {
      logger.error("Missing required fields in request");
      return errorResponse("Missing required fields: recipientEmails, accepterName, neighborhoodName", 400);
    }

    logger.info(`Sending invitation accepted notification for ${accepterName} joining ${neighborhoodName}`);

    // Generate URLs with UTM tracking
    const directoryUrl = `https://neighborhoodos.com/neighbors?utm_source=email&utm_medium=email&utm_campaign=invitation_accepted`;
    const dashboardUrl = `https://neighborhoodos.com/dashboard?utm_source=email&utm_medium=email&utm_campaign=invitation_accepted`;

    // Customize message based on recipient type
    const subject = isAdminNotification 
      ? `New member joined ${neighborhoodName}: ${accepterName}`
      : `${accepterName} accepted your invitation to ${neighborhoodName}`;

    // Render React Email template
    const html = await renderAsync(
      React.createElement(InvitationAcceptedEmail, {
        accepterName,
        neighborhoodName,
        isAdminNotification,
        directoryUrl,
        dashboardUrl,
      })
    );

    // Send email to all recipients
    const emailPromises = recipientEmails.map(email => 
      resend.emails.send({
        from: "neighborhoodOS <hello@updates.neighborhoodos.com>",
        to: [email],
        subject,
        html,
      })
    );

    const emailResponses = await Promise.all(emailPromises);
    logger.info("Invitation accepted emails sent successfully:", emailResponses);

    return successResponse({
      messageIds: emailResponses.map(r => r.data?.id),
      recipientCount: recipientEmails.length
    });

  } catch (error: any) {
    logger.error("Error in send-invitation-accepted function:", error);
    return errorResponse(error.message || "Failed to send invitation accepted notification");
  }
};

serve(handler);
