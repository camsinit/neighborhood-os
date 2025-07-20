
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { WelcomeEmail } from './_templates/welcome-email.tsx';
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Initialize Resend with API key from environment
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Create a logger for this function
const logger = createLogger('send-welcome-email');

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
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body
    const { 
      recipientEmail, 
      firstName, 
      neighborhoodName 
    }: WelcomeEmailRequest = await req.json();

    // Validate required fields
    if (!recipientEmail || !firstName || !neighborhoodName) {
      logger.error("Missing required fields in request");
      return errorResponse("Missing required fields: recipientEmail, firstName, neighborhoodName", 400);
    }

    logger.info(`Sending welcome email to ${firstName} (${recipientEmail}) for ${neighborhoodName}`);

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

    logger.info("Welcome email sent successfully:", emailResponse);

    return successResponse({ messageId: emailResponse.data?.id });

  } catch (error: any) {
    logger.error("Error in send-welcome-email function:", error);
    return errorResponse(error.message || "Failed to send welcome email");
  }
};

serve(handler);
