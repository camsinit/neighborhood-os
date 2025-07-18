
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { WaitlistWelcomeEmail } from './_templates/waitlist-welcome.tsx';

// Create a Supabase client with the service role key for admin permissions
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Resend client for sending emails
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

/**
 * Edge Function to handle waitlist survey submissions
 * 
 * This function receives survey data and saves it to the waitlist_survey_responses table
 * It includes validation and links to the existing waitlist entry via email
 */
serve(async (req) => {
  // Set up CORS headers for the response
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
  };

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

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
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { headers, status: 400 }
      );
    }

    // Validate numeric field (allow 0 as a valid value)
    if (neighborsToOnboard == null || typeof neighborsToOnboard !== 'number' || neighborsToOnboard < 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid neighbor count" }),
        { headers, status: 400 }
      );
    }

    // Validate experience and interest fields
    const validExperience = ['None', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const validInterest = ['Not Interested', 'Not Very Interested', 'Somewhat Interested', 'Interested', 'Very Interested'];
    
    if (!validExperience.includes(aiCodingExperience)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid AI coding experience value" }),
        { headers, status: 400 }
      );
    }
    
    if (!validInterest.includes(openSourceInterest)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid open source interest value" }),
        { headers, status: 400 }
      );
    }

    console.log(`Processing survey submission for email: ${email}`);
    
    // Check if this email exists in the waitlist
    const { data: waitlistEntry, error: waitlistError } = await supabase
      .from("waitlist")
      .select("email")
      .eq("email", email)
      .single();

    if (waitlistError || !waitlistEntry) {
      console.error("Email not found in waitlist:", waitlistError);
      return new Response(
        JSON.stringify({ success: false, error: "Email not found in waitlist" }),
        { headers, status: 400 }
      );
    }

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
        open_source_interest: openSourceInterest
      })
      .select("id, priority_score");

    // Check for errors
    if (error) {
      console.error("Database error:", error);
      
      // Handle duplicate email error specifically
      if (error.code === '23505') { // Unique violation
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Survey already completed for this email!"
          }),
          { headers, status: 200 }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save survey response" }),
        { headers, status: 500 }
      );
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
        console.error("Failed to send Slack survey notification:", slackResponse.status);
      } else {
        console.log("Slack survey notification sent successfully");
      }
    } catch (slackError) {
      console.error("Error sending Slack survey notification:", slackError);
      // Don't fail the main request if Slack fails
    }

    // Send updated waitlist welcome email with survey data after successful survey submission
    try {
      const html = await renderAsync(
        React.createElement(WaitlistWelcomeEmail, {
          userEmail: email,
          baseUrl: supabaseUrl.replace('.supabase.co', '.lovableproject.com'),
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
        from: 'neighborhoodOS <hello@resend.dev>',
        to: [email],
        subject: 'Thanks for your neighborhood instigator survey!',
        html,
      });

      console.log(`Updated waitlist welcome email sent successfully to: ${email}`);
    } catch (emailError) {
      console.error("Error sending updated waitlist welcome email:", emailError);
      // Don't fail the survey submission if email sending fails
    }

    // Success response with priority score
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Survey submitted successfully",
        data: {
          id: data[0]?.id,
          priorityScore: data[0]?.priority_score
        }
      }),
      { headers, status: 200 }
    );
    
  } catch (error) {
    console.error("Error processing survey:", error);
    
    // General error response
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { headers, status: 500 }
    );
  }
});
