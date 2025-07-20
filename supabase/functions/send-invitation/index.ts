import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { BasicInvitationEmail } from './_templates/basic-invitation.tsx';
import { handleCorsPreflightRequest, errorResponse, successResponse, createLogger } from '../_shared/cors.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const logger = createLogger('send-invitation');

interface InviteEmailRequest {
  email: string;
  inviterName: string;
  neighborhoodName: string;
  inviteCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    logger.info('Processing invitation email request');

    const { email, inviterName, neighborhoodName, inviteCode }: InviteEmailRequest = await req.json();

    // Create the invite URL
    const inviteUrl = `https://neighborhoodos.com/join/${inviteCode}`;

    // Render React Email template
    const html = await renderAsync(
      React.createElement(BasicInvitationEmail, {
        inviterName,
        neighborhoodName,
        inviteUrl,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "neighborhoodOS <hello@updates.neighborhoodos.com>",
      to: [email],
      subject: `${inviterName} invited you to join ${neighborhoodName}`,
      html,
    });

    logger.info("Email sent successfully", { messageId: emailResponse.data?.id });

    return successResponse({ emailResponse }, "Invitation email sent successfully");

  } catch (error: any) {
    logger.error("Error in send-invitation function", error);
    return errorResponse(error.message, "Failed to send invitation email");
  }
};

serve(handler);
