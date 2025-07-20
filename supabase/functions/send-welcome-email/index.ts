import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { WelcomeEmail } from './_templates/welcome-email-updated.tsx';

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

// Base URL generators
const getHomeLink = (): string => {
  return `${getEmailBaseUrl()}/dashboard`;
};

const getSkillsLink = (): string => {
  return `${getEmailBaseUrl()}/skills`;
};

const getCreateEventLink = (): string => {
  return `${getEmailBaseUrl()}/events/create`;
};

// Enhanced URL generators with UTM tracking for welcome emails
const getWelcomeURL = (baseFunction: () => string): string => {
  return addEmailTrackingParams(baseFunction(), "welcome_email", "email");
};

/**
 * Interface for welcome email request
 */
interface WelcomeEmailRequest {
  recipientEmail: string;
  firstName: string;
  neighborhoodName: string;
}

/**
 * Edge function to send welcome emails to new neighborhood members
 * Uses plain-text template with minimal HTML fallback
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
      firstName, 
      neighborhoodName 
    }: WelcomeEmailRequest = await req.json();

    // Validate required fields
    if (!recipientEmail || !firstName || !neighborhoodName) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: recipientEmail, firstName, neighborhoodName" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending welcome email to ${firstName} (${recipientEmail}) for ${neighborhoodName}`);

    // Generate email links with UTM tracking
    const homeLink = getWelcomeURL(getHomeLink);
    const skillsLink = getWelcomeURL(getSkillsLink);
    const createEventLink = getWelcomeURL(getCreateEventLink);

    // Render React Email template
    const html = await renderAsync(
      React.createElement(WelcomeEmail, {
        firstName,
        neighborhoodName,
        homeLink,
        skillsLink,
        createEventLink,
      })
    );

    // Send the welcome email using React Email template
    const emailResponse = await resend.emails.send({
      from: "neighborhoodOS <hello@updates.neighborhoodos.com>",
      to: [recipientEmail],
      subject: `Welcome to ${neighborhoodName}, ${firstName}!`,
      html,
    });

    console.log("Welcome email sent successfully:", emailResponse);

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
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send welcome email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
