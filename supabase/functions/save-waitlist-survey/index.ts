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
const logger = createLogger('save-waitlist-survey');

/**
 * Edge Function to handle waitlist survey submissions
 * 
 * This function receives survey data and saves it to the waitlist_survey_responses table
 * It includes validation and links to the existing waitlist entry via email
 */
serve(async (req) => {
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body to get the survey data
    const requestData = await req.json();
    const {
      email,
      firstName,
      lastName,
      neighborhoodName,
      city,
      state,
      neighborsToOnboard,
      aiCodingExperience,
      openSourceInterest
    } = requestData;

    // Validate required fields
    if (!email || !firstName || !lastName || !neighborhoodName || !city || !state) {
      logger.error("Missing required fields in request");
      return errorResponse("Missing required fields", 400);
    }

    // Validate numeric field (allow 0 as a valid value)
    if (neighborsToOnboard == null || typeof neighborsToOnboard !== 'number' || neighborsToOnboard < 0) {
      logger.error("Invalid neighbor count provided");
      return errorResponse("Invalid neighbor count", 400);
    }

    // Validate experience and interest fields
    const validExperience = ['None', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const validInterest = ['Not Interested', 'Not Very Interested', 'Somewhat Interested', 'Interested', 'Very Interested'];
    
    if (!validExperience.includes(aiCodingExperience)) {
      logger.error("Invalid AI coding experience value");
      return errorResponse("Invalid AI coding experience value", 400);
    }
    
    if (!validInterest.includes(openSourceInterest)) {
      logger.error("Invalid open source interest value");
      return errorResponse("Invalid open source interest value", 400);
    }

    logger.info(`Processing survey submission for email: ${email}`);
    
    // Check if this email exists in the waitlist
    const { data: waitlistEntry, error: waitlistError } = await supabase
      .from("waitlist")
      .select("email")
      .eq("email", email)
      .single();

    if (waitlistError || !waitlistEntry) {
      logger.error("Email not found in waitlist:", waitlistError);
      return errorResponse("Email not found in waitlist", 400);
    }

    // Calculate priority score using database function
    const { data: priorityData } = await supabase
      .rpc('calculate_priority_score', {
        neighbors_count: neighborsToOnboard,
        ai_experience: aiCodingExperience,
        open_source: openSourceInterest
      });

    // Insert survey response into database
    const { data, error } = await supabase
      .from("waitlist_survey_responses")
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        neighborhood_name: neighborhoodName,
        city,
        state,
        neighbors_to_onboard: neighborsToOnboard,
        ai_coding_experience: aiCodingExperience,
        open_source_interest: openSourceInterest,
        priority_score: priorityData || 0
      })
      .select("id, priority_score");

    // Check for errors
    if (error) {
      logger.error("Database error:", error);
      
      // Handle duplicate email error specifically
      if (error.code === '23505') { // Unique violation
        return successResponse(null, "Survey already completed for this email!");
      }
      
      return errorResponse("Failed to save survey response");
    }

    // Send Slack notification for survey submission
    try {
      const slackResponse = await fetch(`https://nnwzfliblfuldwxpuata.supabase.co/functions/v1/slack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          type: 'survey_submission',
          data: {
            email,
            firstName,
            lastName,
            neighborhoodName,
            city,
            state,
            neighborsToOnboard,
            aiCodingExperience,
            openSourceInterest,
            priorityScore: data[0]?.priority_score || 0,
            timestamp: new Date().toISOString(),
          }
        }),
      });
      
      if (!slackResponse.ok) {
        logger.error("Failed to send Slack survey notification:", slackResponse.status);
      } else {
        logger.info("Slack survey notification sent successfully");
      }
    } catch (slackError) {
      logger.error("Error sending Slack survey notification:", slackError);
      // Don't fail the main request if Slack fails
    }

    // Send updated waitlist welcome email with survey data after successful survey submission
    try {
      const html = await renderAsync(
        React.createElement(WaitlistWelcomeEmail, {
          userEmail: email,
          // Always use the public production domain in emails so links work for everyone
          baseUrl: 'https://neighborhoodos.com',
          firstName: firstName,
          lastName: lastName,
          neighborhoodName: neighborhoodName,
          city: city,
          state: state,
          neighborsToOnboard: neighborsToOnboard,
          aiCodingExperience: aiCodingExperience,
          openSourceInterest: openSourceInterest,
        })
      );

      await resend.emails.send({
        from: 'neighborhoodOS <hello@updates.neighborhoodos.com>',
        to: [email],
        subject: 'Thanks for your neighborhood instigator survey!',
        html,
        // Disable Resend's automatic link tracking to prevent URL wrapping
        tracking: {
          opens: true,
          clicks: false, // This prevents the long tracking URLs
        },});

      logger.info(`Updated waitlist welcome email sent successfully to: ${email}`);
    } catch (emailError) {
      logger.error("Error sending updated waitlist welcome email:", emailError);
      // Don't fail the survey submission if email sending fails
    }

    // Success response with priority score
    return successResponse({
      id: data[0]?.id,
      priorityScore: data[0]?.priority_score
    }, "Survey submitted successfully");
    
  } catch (error) {
    logger.error("Error processing survey:", error);
    return errorResponse("Internal server error");
  }
});
