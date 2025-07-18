
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
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

    const emailResponse = await resend.emails.send({
      from: "Neighborhood OS <invites@neighborhoodos.com>",
      to: [email],
      subject: `You're invited to join ${neighborhoodName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You're invited to join ${neighborhoodName}!</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Hi there! ${inviterName} has invited you to join their neighborhood community on Neighborhood OS.
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Neighborhood OS is a platform where neighbors can:
          </p>
          
          <ul style="color: #555; font-size: 16px; line-height: 1.6;">
            <li>Share skills and help each other</li>
            <li>Exchange goods and services</li>
            <li>Stay updated on neighborhood events</li>
            <li>Build a stronger community together</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #0EA5E9; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: 600;
                      display: inline-block;">
              Join ${neighborhoodName}
            </a>
          </div>
          
          <p style="color: #777; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link into your browser: ${inviteUrl}
          </p>
          
          <p style="color: #777; font-size: 14px; line-height: 1.6;">
            This invitation link will expire in 7 days.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            You're receiving this because ${inviterName} invited you to join their neighborhood.
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    logger.info("Email sent successfully", { messageId: emailResponse.data?.id });

    return successResponse({ emailResponse }, "Invitation email sent successfully");
  } catch (error: any) {
    logger.error("Error in send-invitation function", error);
    return errorResponse(error.message || "Failed to send invitation email", 500);
  }
};

serve(handler);
