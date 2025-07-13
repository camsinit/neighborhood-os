import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { OnboardingCommunityEmail } from './_templates/onboarding-1-community.tsx';
import { OnboardingEventsEmail } from './_templates/onboarding-2-events.tsx';
import { OnboardingSkillsEmail } from './_templates/onboarding-3-skills.tsx';
import { OnboardingGoodsEmail } from './_templates/onboarding-4-goods.tsx';
import { OnboardingSafetyEmail } from './_templates/onboarding-5-safety.tsx';
import { OnboardingDirectoryEmail } from './_templates/onboarding-6-directory.tsx';
import { OnboardingModulesEmail } from './_templates/onboarding-7-modules.tsx';

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

const getEventsLink = (): string => {
  return `${getEmailBaseUrl()}/events`;
};

const getCreateEventLink = (): string => {
  return `${getEmailBaseUrl()}/events/create`;
};

const getSkillsLink = (): string => {
  return `${getEmailBaseUrl()}/skills`;
};

const getFreebiesLink = (): string => {
  return `${getEmailBaseUrl()}/goods`;
};

const getUpdatesLink = (): string => {
  return `${getEmailBaseUrl()}/safety`;
};

const getDirectoryLink = (): string => {
  return `${getEmailBaseUrl()}/neighbors`;
};

const getModulesLink = (): string => {
  return `${getEmailBaseUrl()}/settings`;
};

// Enhanced URL generators with UTM tracking for onboarding emails
const getOnboardingURL = (baseFunction: () => string, step: number): string => {
  return addEmailTrackingParams(baseFunction(), `onboarding_step_${step}`, "email");
};

/**
 * Interface for onboarding email request
 */
interface OnboardingEmailRequest {
  recipientEmail: string;
  firstName: string;
  neighborhoodName: string;
  emailNumber: number; // 1-7 for the drip series
}

/**
 * Get React Email template component and subject for onboarding emails
 */
const getOnboardingTemplate = (emailNumber: number, firstName: string, neighborhoodName: string) => {
  const subjects = {
    1: `The scoop on what's happening in ${neighborhoodName}`,
    2: `What's happening around ${neighborhoodName}?`,
    3: `What are you surprisingly good at, ${firstName}?`,
    4: `One person's trash is another person's treasure (literally)`,
    5: `Stay in the loop (without the drama)`,
    6: `Meet your neighbors (they're actually pretty cool)`,
    7: `Making ${neighborhoodName} work for everyone`
  };

  const templates = {
    1: {
      subject: subjects[1],
      component: OnboardingCommunityEmail,
      props: {
        firstName,
        neighborhoodName,
        homeLink: getOnboardingURL(getHomeLink, 1)
      }
    },
    2: {
      subject: subjects[2],
      component: OnboardingEventsEmail,
      props: {
        firstName,
        neighborhoodName,
        eventsLink: getOnboardingURL(getEventsLink, 2),
        createEventLink: getOnboardingURL(getCreateEventLink, 2)
      }
    },
    3: {
      subject: subjects[3],
      component: OnboardingSkillsEmail,
      props: {
        firstName,
        skillsLink: getOnboardingURL(getSkillsLink, 3)
      }
    },
    4: {
      subject: subjects[4],
      component: OnboardingGoodsEmail,
      props: {
        firstName,
        neighborhoodName,
        goodsLink: getOnboardingURL(getFreebiesLink, 4)
      }
    },
    5: {
      subject: subjects[5],
      component: OnboardingSafetyEmail,
      props: {
        firstName,
        safetyLink: getOnboardingURL(getUpdatesLink, 5)
      }
    },
    6: {
      subject: subjects[6],
      component: OnboardingDirectoryEmail,
      props: {
        firstName,
        directoryLink: getOnboardingURL(getDirectoryLink, 6)
      }
    },
    7: {
      subject: subjects[7],
      component: OnboardingModulesEmail,
      props: {
        firstName,
        neighborhoodName,
        modulesLink: getOnboardingURL(getModulesLink, 7)
      }
    }
  };

  return templates[emailNumber as keyof typeof templates];
};

/**
 * Edge function to send onboarding drip series emails
 * Sends emails 1-7 of the onboarding sequence
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
      neighborhoodName,
      emailNumber
    }: OnboardingEmailRequest = await req.json();

    // Validate required fields
    if (!recipientEmail || !firstName || !neighborhoodName || !emailNumber) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: recipientEmail, firstName, neighborhoodName, emailNumber" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email number is within range
    if (emailNumber < 1 || emailNumber > 7) {
      return new Response(
        JSON.stringify({ 
          error: "emailNumber must be between 1 and 7" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending onboarding email ${emailNumber} to ${firstName} (${recipientEmail}) for ${neighborhoodName}`);

    // Get the React Email template for this step
    const template = getOnboardingTemplate(emailNumber, firstName, neighborhoodName);

    if (!template) {
      return new Response(
        JSON.stringify({ 
          error: `No template found for email number ${emailNumber}` 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Render React Email template
    const html = await renderAsync(
      React.createElement(template.component, template.props)
    );

    // Send the onboarding email using React Email
    const emailResponse = await resend.emails.send({
      from: "NeighborhoodOS <hello@neighborhoodos.com>",
      to: [recipientEmail],
      subject: template.subject,
      html,
    });

    console.log(`Onboarding email ${emailNumber} sent successfully:`, emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id,
        emailNumber: emailNumber
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
    console.error("Error in send-onboarding-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send onboarding email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);