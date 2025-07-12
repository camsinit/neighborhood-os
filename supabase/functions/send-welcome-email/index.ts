import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key from environment
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Get the production base URL for email links
 * Always returns neighborhoodos.com for email consistency
 */
const getEmailBaseUrl = (): string => {
  return "https://neighborhoodos.com";
};

/**
 * Generate deep links for email templates
 */
const getHomeLink = (): string => {
  return `${getEmailBaseUrl()}/dashboard`;
};

const getSkillsLink = (): string => {
  return `${getEmailBaseUrl()}/skills`;
};

const getCreateEventLink = (): string => {
  return `${getEmailBaseUrl()}/events/create`;
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

    // Generate email links
    const homeLink = getHomeLink();
    const skillsLink = getSkillsLink();
    const createEventLink = getCreateEventLink();

    // Send the welcome email using plain-text template
    const emailResponse = await resend.emails.send({
      from: "NeighborhoodOS <hello@neighborhoodos.com>",
      to: [recipientEmail],
      subject: `Welcome to ${neighborhoodName}, ${firstName}!`,
      text: `Hey ${firstName},

Welcome to ${neighborhoodName} on NeighborhoodOS! 

You're officially part of the neighborhood now. No turning back. (Just kidding - you can leave anytime, but we hope you won't want to.)

Here's how to make the most of your new digital neighborhood:

🏠 **Explore your neighborhood**: Check out what's happening around you
${homeLink}

🤝 **Share your skills**: Let neighbors know what you're good at (even if it's just making excellent grilled cheese)
${skillsLink}

🎉 **Create your first event**: Host something simple and fun. Here are some low-effort ideas:
   - "Coffee on my porch" (bring your own mug)
   - "Dog meetup at the park" (humans welcome too)
   - "Neighborhood walk" (walking optional, chatting required)

${createEventLink}

That's it! No 47-step tutorials or complicated setup. Just neighbors being neighborly.

Questions? Just reply to this email. We're real people, not robots.

Welcome aboard,
The NeighborhoodOS Team`,
      // Add minimal HTML for email clients that prefer it
      html: `<p>Hey ${firstName},</p>

<p>Welcome to ${neighborhoodName} on NeighborhoodOS!</p>

<p>You're officially part of the neighborhood now. No turning back. (Just kidding - you can leave anytime, but we hope you won't want to.)</p>

<p>Here's how to make the most of your new digital neighborhood:</p>

<p>🏠 <strong>Explore your neighborhood</strong>: Check out what's happening around you<br>
<a href="${homeLink}">${homeLink}</a></p>

<p>🤝 <strong>Share your skills</strong>: Let neighbors know what you're good at (even if it's just making excellent grilled cheese)<br>
<a href="${skillsLink}">${skillsLink}</a></p>

<p>🎉 <strong>Create your first event</strong>: Host something simple and fun. Here are some low-effort ideas:</p>
<ul>
<li>"Coffee on my porch" (bring your own mug)</li>
<li>"Dog meetup at the park" (humans welcome too)</li>
<li>"Neighborhood walk" (walking optional, chatting required)</li>
</ul>

<p><a href="${createEventLink}">${createEventLink}</a></p>

<p>That's it! No 47-step tutorials or complicated setup. Just neighbors being neighborly.</p>

<p>Questions? Just reply to this email. We're real people, not robots.</p>

<p>Welcome aboard,<br>
The NeighborhoodOS Team</p>`,
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