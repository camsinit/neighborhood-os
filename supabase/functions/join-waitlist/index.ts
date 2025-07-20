
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { WaitlistWelcomeEmail } from './_templates/waitlist-welcome.tsx';
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Create a Supabase client with the service role key for admin permissions
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Resend client for sending emails
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Create a logger for this function
const logger = createLogger('join-waitlist');

/**
 * Edge Function to handle waitlist signups
 * 
 * This function receives an email address and adds it to the waitlist
 * table in the database. It includes validation and error handling.
 */
serve(async (req) => {
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body to get the email
    const requestData = await req.json();
    const { email } = requestData;

    // Validate email
    if (!email) {
      logger.error("Email is required but not provided");
      return errorResponse("Email is required", 400);
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.error("Invalid email format provided");
      return errorResponse("Invalid email format", 400);
    }

    logger.info(`Processing waitlist signup for email: ${email}`);
    
    // Insert email into waitlist table
    const { data, error } = await supabase
      .from("waitlist")
      .insert({ email })
      .select("id, email");

    // Check for errors
    if (error) {
      logger.error("Database error:", error);
      
      // Handle duplicate email error specifically
      if (error.code === '23505') { // Unique violation
        return successResponse(null, "You're already on our waitlist!");
      }
      
      return errorResponse("Failed to join waitlist");
    }

    // Send Slack notification for new waitlist signup
    try {
      const slackResponse = await fetch(`https://nnwzfliblfuldwxpuata.supabase.co/functions/v1/slack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          type: 'waitlist_signup',
          data: {
            email,
            timestamp: new Date().toISOString(),
          }
        }),
      });
      
      if (!slackResponse.ok) {
        logger.error("Failed to send Slack notification:", slackResponse.status);
      } else {
        logger.info("Slack notification sent successfully");
      }
    } catch (slackError) {
      logger.error("Error sending Slack notification:", slackError);
      // Don't fail the main request if Slack fails
    }

    // Send welcome email after successful waitlist signup
    try {
      const html = await renderAsync(
        React.createElement(WaitlistWelcomeEmail, {
          userEmail: email,
          baseUrl: supabaseUrl.replace('.supabase.co', '.lovableproject.com'),
        })
      );

      await resend.emails.send({
        from: 'neighborhoodOS <hello@resend.dev>',
        to: [email],
        subject: 'Welcome to neighborhoodOS - You\'re on the waitlist!',
        html,
      });

      logger.info(`Welcome email sent successfully to: ${email}`);
    } catch (emailError) {
      logger.error("Error sending welcome email:", emailError);
      // Don't fail the waitlist signup if email sending fails
    }

    // Success response
    return successResponse(data, "Successfully joined the waitlist");
    
  } catch (error) {
    logger.error("Error processing request:", error);
    return errorResponse("Internal server error");
  }
});
