
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
 * Get the production base URL for email links
 * Always returns neighborhoodos.com for email consistency
 */
const getEmailBaseUrl = (): string => {
  return "https://neighborhoodos.com";
};

/**
 * Generate invite link with production URL
 */
const getInviteLink = (inviteCode: string): string => {
  return `${getEmailBaseUrl()}/join/${inviteCode}`;
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

    // Send the invitation email using plain-text template
    const emailResponse = await resend.emails.send({
      from: "NeighborhoodOS <hello@neighborhoodos.com>",
      to: [recipientEmail],
      subject: `Your neighbor ${inviterName} invited you to join ${neighborhoodName} on NeighborhoodOS`,
      text: `Hi there!

${inviterName} thought you'd be a great addition to the ${neighborhoodName} community on NeighborhoodOS.

This isn't another social media rabbit hole, promise. Just a simple way for neighbors to share useful stuff - like who's giving away extra tomatoes, when the next block party is, or if someone spotted a loose dog wandering around.

Ready to see what your neighbors are up to?

Join ${neighborhoodName}: ${inviteUrl}

This invite expires in 7 days (because nothing good lasts forever).

Welcome to the neighborhood,
The NeighborhoodOS Team`,
      // Add minimal HTML for email clients that prefer it
      html: `<p>Hi there!</p>

<p>${inviterName} thought you'd be a great addition to the ${neighborhoodName} community on NeighborhoodOS.</p>

<p>This isn't another social media rabbit hole, promise. Just a simple way for neighbors to share useful stuff - like who's giving away extra tomatoes, when the next block party is, or if someone spotted a loose dog wandering around.</p>

<p>Ready to see what your neighbors are up to?</p>

<p><a href="${inviteUrl}">Join ${neighborhoodName}</a></p>

<p>This invite expires in 7 days (because nothing good lasts forever).</p>

<p>Welcome to the neighborhood,<br>
The NeighborhoodOS Team</p>`,
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
