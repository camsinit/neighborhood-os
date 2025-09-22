
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { OnboardingCommunityEmail } from './_templates/onboarding-1-community.tsx';
import { OnboardingEventsEmail } from './_templates/onboarding-2-events.tsx';
import { OnboardingSkillsEmail } from './_templates/onboarding-3-skills.tsx';
// import { OnboardingGoodsEmail } from './_templates/onboarding-4-goods.tsx'; // Removed feature
// import { OnboardingSafetyEmail } from './_templates/onboarding-5-safety.tsx'; // Removed feature
import { OnboardingDirectoryEmail } from './_templates/onboarding-6-directory.tsx';
import { OnboardingModulesEmail } from './_templates/onboarding-7-modules.tsx';
import { handleCorsPreflightRequest, errorResponse, successResponse, createLogger } from '../_shared/cors.ts';

// Initialize Resend with API key from environment
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize logger for this function
const logger = createLogger('send-onboarding-email');

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
    // 4: {
    //   subject: subjects[4],
    //   component: OnboardingGoodsEmail, // Removed feature
    //   props: {
    //     firstName,
    //     neighborhoodName,
    //     goodsLink: getOnboardingURL(getFreebiesLink, 4)
    //   }
    // },
    // 5: {
    //   subject: subjects[5],
    //   component: OnboardingSafetyEmail, // Removed feature
    //   props: {
    //     firstName,
    //     safetyLink: getOnboardingURL(getUpdatesLink, 5)
    //   }
    // },
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
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    logger.info('Processing onboarding email request');

    // Parse the request body
    const requestBody = await req.json();
    logger.info('Request body received:', requestBody);

    const { 
      recipientEmail, 
      firstName, 
      neighborhoodName,
      emailNumber
    }: OnboardingEmailRequest = requestBody;

    // Validate required fields
    logger.info('Validating required fields:', {
      hasRecipientEmail: !!recipientEmail,
      hasFirstName: !!firstName,
      hasNeighborhoodName: !!neighborhoodName,
      hasEmailNumber: !!emailNumber,
      emailNumber: emailNumber
    });

    if (!recipientEmail || !firstName || !neighborhoodName || !emailNumber) {
      logger.error('Missing required fields in request', {
        recipientEmail: !!recipientEmail,
        firstName: !!firstName,
        neighborhoodName: !!neighborhoodName,
        emailNumber: !!emailNumber
      });
      return errorResponse("Missing required fields: recipientEmail, firstName, neighborhoodName, emailNumber", 400);
    }

    // Validate email number is within range
    if (emailNumber < 1 || emailNumber > 7) {
      logger.error(`Invalid email number: ${emailNumber}`);
      return errorResponse("emailNumber must be between 1 and 7", 400);
    }

    logger.info(`Sending onboarding email ${emailNumber} to ${firstName} (${recipientEmail}) for ${neighborhoodName}`);

    // Get the React Email template for this step
    logger.info(`Retrieving template for email number ${emailNumber}`);
    const template = getOnboardingTemplate(emailNumber, firstName, neighborhoodName);

    if (!template) {
      logger.error(`No template found for email number ${emailNumber}`);
      return errorResponse(`No template found for email number ${emailNumber}`, 400);
    }

    logger.info('Template retrieved successfully:', {
      hasComponent: !!template.component,
      hasProps: !!template.props,
      subject: template.subject
    });

    // Render React Email template
    logger.info('Starting React Email rendering');
    const html = await renderAsync(
      React.createElement(template.component, template.props)
    );
    logger.info('React Email rendering completed', { htmlLength: html.length });

    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      logger.error('RESEND_API_KEY not configured');
      return errorResponse("Email service not configured", 500);
    }
    logger.info('Resend API key found, proceeding with email send');

    // Send the onboarding email using React Email with the correct verified domain
    logger.info('Attempting to send email via Resend', {
      from: "NeighborhoodOS <hello@updates.neighborhoodos.com>",
      to: recipientEmail,
      subject: template.subject
    });

    const emailResponse = await resend.emails.send({
      from: "NeighborhoodOS <hello@updates.neighborhoodos.com>", // Updated to use verified domain
      to: [recipientEmail],
      subject: template.subject,
      html,
      // Disable Resend's automatic link tracking to prevent URL wrapping
      tracking: {
        opens: true,
        clicks: false, // This prevents the long tracking URLs
      },
    });

    logger.info('Resend response received:', {
      success: !!emailResponse.data,
      messageId: emailResponse.data?.id,
      error: emailResponse.error,
      fullResponse: emailResponse // Log the complete response for debugging
    });

    // Check for Resend errors
    if (emailResponse.error) {
      logger.error('Resend returned an error:', emailResponse.error);
      return errorResponse(`Email service error: ${emailResponse.error.message}`, 500);
    }

    logger.info(`Onboarding email ${emailNumber} sent successfully`, { 
      messageId: emailResponse.data?.id,
      recipient: recipientEmail,
      subject: template.subject
    });

    return successResponse({ 
      messageId: emailResponse.data?.id,
      emailNumber: emailNumber
    }, `Onboarding email ${emailNumber} sent successfully`);

  } catch (error: any) {
    logger.error("Error in send-onboarding-email function", {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return errorResponse(error.message || "Failed to send onboarding email", 500);
  }
};

serve(handler);
