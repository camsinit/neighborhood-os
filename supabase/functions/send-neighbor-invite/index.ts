
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { NeighborInviteEmail } from './_templates/neighbor-invite.tsx';

// Initialize Resend with API key from environment
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * URL Generation Utilities for Email Templates
 * Importing centralized URL generation with UTM tracking
 */

// Get the production base URL for email links
const getEmailBaseUrl = (): string => {
  return "https://neighborhoodos.com";
};

// Add UTM parameters for email tracking
const addEmailTrackingParams = (url: string, campaign: string, source: string = "email"): string => {
  const urlObj = new URL(url);
  urlObj.searchParams.set("utm_source", source);
  urlObj.searchParams.set("utm_medium", "email");
  urlObj.searchParams.set("utm_campaign", campaign);
  return urlObj.toString();
};

// Generate invite link with UTM tracking
const getInviteURL = (inviteCode: string): string => {
  const baseUrl = `${getEmailBaseUrl()}/join/${inviteCode}`;
  return addEmailTrackingParams(baseUrl, "neighbor_invite", "email");
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

    // Extract invite code from URL to generate tracked URL
    const urlParts = inviteUrl.split('/');
    const inviteCode = urlParts[urlParts.length - 1];
    const trackedInviteUrl = getInviteURL(inviteCode);

    // Render React Email template
    const html = await renderAsync(
      React.createElement(NeighborInviteEmail, {
        inviterName,
        neighborhoodName,
        inviteUrl: trackedInviteUrl,
      })
    );

    // Send the invitation email using React Email template
    const emailResponse = await resend.emails.send({
      from: "NeighborhoodOS <hello@neighborhoodos.com>",
      to: [recipientEmail],
      subject: `Your neighbor ${inviterName} invited you to join ${neighborhoodName} on NeighborhoodOS`,
      html,
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
