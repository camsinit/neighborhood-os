
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
 * Edge Function to handle waitlist signups
 * 
 * This function receives an email address and adds it to the waitlist
 * table in the database. It includes validation and error handling.
 */
serve(async (req) => {
  // Set up CORS headers for the response - updated to include x-application-name
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
    // Parse the request body to get the email
    const requestData = await req.json();
    const { email } = requestData;

    // Validate email
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { headers, status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        { headers, status: 400 }
      );
    }

    console.log(`Processing waitlist signup for email: ${email}`);
    
    // Insert email into waitlist table
    const { data, error } = await supabase
      .from("waitlist")
      .insert({ email })
      .select("id, email");

    // Check for errors
    if (error) {
      console.error("Database error:", error);
      
      // Handle duplicate email error specifically
      if (error.code === '23505') { // Unique violation
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "You're already on our waitlist!"
          }),
          { headers, status: 200 }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: "Failed to join waitlist" }),
        { headers, status: 500 }
      );
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
        console.error("Failed to send Slack notification:", slackResponse.status);
      } else {
        console.log("Slack notification sent successfully");
      }
    } catch (slackError) {
      console.error("Error sending Slack notification:", slackError);
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

      console.log(`Welcome email sent successfully to: ${email}`);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail the waitlist signup if email sending fails
    }

    // Success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully joined the waitlist",
        data
      }),
      { headers, status: 200 }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    // General error response
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { headers, status: 500 }
    );
  }
});
