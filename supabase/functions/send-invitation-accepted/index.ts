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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: recipientEmails, accepterName, neighborhoodName" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending invitation accepted notification for ${accepterName} joining ${neighborhoodName}`);

    // Customize message based on recipient type
    const subject = isAdminNotification 
      ? `New member joined ${neighborhoodName}: ${accepterName}`
      : `${accepterName} accepted your invitation to ${neighborhoodName}`;

    const textContent = isAdminNotification 
      ? `Great news! ${accepterName} has joined ${neighborhoodName}.

As the neighborhood admin, you can see all members in your neighborhood directory and help new neighbors get connected.

Keep building your community!

Best,
The NeighborhoodOS Team`
      : `Good news! ${accepterName} has accepted your invitation to join ${neighborhoodName}.

Your neighborhood is growing! ${accepterName} is now part of the community and can start connecting with neighbors, sharing skills, and participating in events.

Thanks for helping grow your neighborhood,
The NeighborhoodOS Team`;

    const htmlContent = isAdminNotification 
      ? `<p>Great news! ${accepterName} has joined ${neighborhoodName}.</p>

<p>As the neighborhood admin, you can see all members in your neighborhood directory and help new neighbors get connected.</p>

<p>Keep building your community!</p>

<p>Best,<br>
The NeighborhoodOS Team</p>`
      : `<p>Good news! ${accepterName} has accepted your invitation to join ${neighborhoodName}.</p>

<p>Your neighborhood is growing! ${accepterName} is now part of the community and can start connecting with neighbors, sharing skills, and participating in events.</p>

<p>Thanks for helping grow your neighborhood,<br>
The NeighborhoodOS Team</p>`;

    // Send email to all recipients
    const emailPromises = recipientEmails.map(email => 
      resend.emails.send({
        from: "NeighborhoodOS <hello@neighborhoodos.com>",
        to: [email],
        subject,
        text: textContent,
        html: htmlContent,
      })
    );

    const emailResponses = await Promise.all(emailPromises);
    console.log("Invitation accepted emails sent successfully:", emailResponses);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageIds: emailResponses.map(r => r.data?.id),
        recipientCount: recipientEmails.length
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
    console.error("Error in send-invitation-accepted function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send invitation accepted notification" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);