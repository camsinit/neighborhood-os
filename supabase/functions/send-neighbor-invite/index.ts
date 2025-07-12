
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key from environment
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Interface for neighbor invite email request
 */
interface NeighborInviteRequest {
  recipientEmail: string;
  inviterName: string;
  neighborhoodName: string;
  inviteUrl: string;
}

/**
 * Edge function to send neighbor invitations via email
 * Uses Resend to deliver personalized invitation emails
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { 
      recipientEmail, 
      inviterName, 
      neighborhoodName, 
      inviteUrl 
    }: NeighborInviteRequest = await req.json();

    // Validate required fields
    if (!recipientEmail || !inviterName || !neighborhoodName || !inviteUrl) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: recipientEmail, inviterName, neighborhoodName, inviteUrl" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending neighbor invite from ${inviterName} to ${recipientEmail} for ${neighborhoodName}`);

    // Send the invitation email
    const emailResponse = await resend.emails.send({
      from: "Neighborhood OS <hello@neighborhoodos.com>",
      to: [recipientEmail],
      subject: `${inviterName} invited you to join ${neighborhoodName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">You're invited to join your neighborhood!</h1>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Hi there! <strong>${inviterName}</strong> has invited you to join <strong>${neighborhoodName}</strong> on Neighborhood OS.
          </p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            Neighborhood OS helps neighbors connect, share resources, and build stronger communities together. 
            You can discover local events, share skills, find help when you need it, and get to know the people around you.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
              Join ${neighborhoodName}
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            This invitation was sent by ${inviterName}. If you didn't expect this invitation, 
            you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-neighbor-invite function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send invitation email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
