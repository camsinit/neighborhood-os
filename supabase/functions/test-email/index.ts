import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { WaitlistWelcomeEmail } from "./_templates/waitlist-welcome.tsx";

// Initialize Resend with API key from environment
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers for web app requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  recipientEmail: string;
  testType?: 'waitlist' | 'survey';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Test email function called");
    
    const { recipientEmail, testType = 'waitlist' }: TestEmailRequest = await req.json();
    
    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "recipientEmail is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if RESEND_API_KEY is configured
    if (!Deno.env.get("RESEND_API_KEY")) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Test data for email rendering
    const testData = testType === 'survey' ? {
      userEmail: recipientEmail,
      firstName: "Test",
      lastName: "User", 
      neighborhoodName: "Maple Street Neighbors",
      city: "Portland",
      state: "OR",
      neighborsToOnboard: 15,
      aiCodingExperience: "Intermediate",
      openSourceInterest: "Very Interested"
    } : {
      userEmail: recipientEmail,
      firstName: "Test",
      // Leave other fields undefined to test the basic waitlist flow
    };

    console.log("Rendering email with test data:", testData);

    // Render the React email template to HTML
    const html = await renderAsync(
      React.createElement(WaitlistWelcomeEmail, testData)
    );

    console.log("Email rendered successfully, sending...");

    // Send the test email using Resend
    const emailResponse = await resend.emails.send({
      from: "NeighborhoodOS Test <onboarding@resend.dev>", // You'll need to replace this with your verified domain
      to: [recipientEmail],
      subject: `Test Email - ${testType === 'survey' ? 'Survey Submitted' : 'Waitlist Welcome'}`,
      html: html,
      // Disable Resend's automatic link tracking to prevent URL wrapping
      tracking: {
        opens: true,
        clicks: false, // This prevents the long tracking URLs
      },
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Test email sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in test-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check function logs for more information" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);