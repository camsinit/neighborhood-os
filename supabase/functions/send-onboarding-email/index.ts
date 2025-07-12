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

const getEventsLink = (): string => {
  return `${getEmailBaseUrl()}/events`;
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
 * Email templates for the 7-part onboarding series
 */
const getEmailTemplate = (emailNumber: number, firstName: string, neighborhoodName: string) => {
  const templates = {
    1: {
      subject: `The scoop on what's happening in ${neighborhoodName}`,
      text: `Hi ${firstName},

Ready for the grand tour? Your neighborhood homepage is where all the action happens.

${getHomeLink()}

Think of it as your neighborhood's front porch - you'll see who's doing what, what events are coming up, and get a general sense of the vibe. 

No algorithm deciding what you see. Just real updates from real neighbors about real stuff. Refreshing, right?

Take a peek and see what you've been missing,
The NeighborhoodOS Team`,
      html: `<p>Hi ${firstName},</p>

<p>Ready for the grand tour? Your neighborhood homepage is where all the action happens.</p>

<p><a href="${getHomeLink()}">${getHomeLink()}</a></p>

<p>Think of it as your neighborhood's front porch - you'll see who's doing what, what events are coming up, and get a general sense of the vibe.</p>

<p>No algorithm deciding what you see. Just real updates from real neighbors about real stuff. Refreshing, right?</p>

<p>Take a peek and see what you've been missing,<br>
The NeighborhoodOS Team</p>`
    },
    2: {
      subject: `What's happening around ${neighborhoodName}?`,
      text: `${firstName},

Event planning doesn't have to be rocket science (unless you're hosting a rocket science meetup, in which case, cool).

${getEventsLink()}

See what's coming up in ${neighborhoodName}, or create something yourself. Block parties, book clubs, or "let's all just sit outside and complain about the weather" gatherings - they're all fair game.

Pro tip: The best neighborhood events are usually the simplest ones.

Happy event hunting,
The NeighborhoodOS Team`,
      html: `<p>${firstName},</p>

<p>Event planning doesn't have to be rocket science (unless you're hosting a rocket science meetup, in which case, cool).</p>

<p><a href="${getEventsLink()}">${getEventsLink()}</a></p>

<p>See what's coming up in ${neighborhoodName}, or create something yourself. Block parties, book clubs, or "let's all just sit outside and complain about the weather" gatherings - they're all fair game.</p>

<p>Pro tip: The best neighborhood events are usually the simplest ones.</p>

<p>Happy event hunting,<br>
The NeighborhoodOS Team</p>`
    },
    3: {
      subject: `What are you surprisingly good at, ${firstName}?`,
      text: `Hey ${firstName},

Everyone's good at something. Maybe you make killer banana bread, know how to fix squeaky hinges, or can fold a fitted sheet properly (seriously, that's a superpower).

${getSkillsLink()}

Share what you're good at, or find someone who can help with that thing you've been putting off for months. It's like a neighborhood favor exchange, but more organized and less awkward.

Warning: You might actually enjoy helping your neighbors. Side effects include feeling useful and making new friends.

Share away,
The NeighborhoodOS Team`,
      html: `<p>Hey ${firstName},</p>

<p>Everyone's good at something. Maybe you make killer banana bread, know how to fix squeaky hinges, or can fold a fitted sheet properly (seriously, that's a superpower).</p>

<p><a href="${getSkillsLink()}">${getSkillsLink()}</a></p>

<p>Share what you're good at, or find someone who can help with that thing you've been putting off for months. It's like a neighborhood favor exchange, but more organized and less awkward.</p>

<p>Warning: You might actually enjoy helping your neighbors. Side effects include feeling useful and making new friends.</p>

<p>Share away,<br>
The NeighborhoodOS Team</p>`
    },
    4: {
      subject: `One person's trash is another person's treasure (literally)`,
      text: `${firstName},

Got stuff you don't need? Need stuff you don't have? The freebies page is your new best friend.

${getFreebiesLink()}

From extra garden vegetables to that exercise bike you swore you'd use, neighbors in ${neighborhoodName} are sharing all kinds of useful (and occasionally weird) stuff.

It's like garage sale season, but without the early morning price negotiations.

Happy treasure hunting,
The NeighborhoodOS Team`,
      html: `<p>${firstName},</p>

<p>Got stuff you don't need? Need stuff you don't have? The freebies page is your new best friend.</p>

<p><a href="${getFreebiesLink()}">${getFreebiesLink()}</a></p>

<p>From extra garden vegetables to that exercise bike you swore you'd use, neighbors in ${neighborhoodName} are sharing all kinds of useful (and occasionally weird) stuff.</p>

<p>It's like garage sale season, but without the early morning price negotiations.</p>

<p>Happy treasure hunting,<br>
The NeighborhoodOS Team</p>`
    },
    5: {
      subject: `Stay in the loop (without the drama)`,
      text: `Hi ${firstName},

Remember group chats that spiral into debates about proper hedge trimming techniques? Yeah, we don't do that here.

${getUpdatesLink()}

The updates page is for simple, useful neighborhood info. Construction notices, lost pet alerts, "heads up about the ice cream truck route" - the good stuff without the commentary.

Just neighbors keeping neighbors informed. Novel concept, we know.

Stay informed,
The NeighborhoodOS Team`,
      html: `<p>Hi ${firstName},</p>

<p>Remember group chats that spiral into debates about proper hedge trimming techniques? Yeah, we don't do that here.</p>

<p><a href="${getUpdatesLink()}">${getUpdatesLink()}</a></p>

<p>The updates page is for simple, useful neighborhood info. Construction notices, lost pet alerts, "heads up about the ice cream truck route" - the good stuff without the commentary.</p>

<p>Just neighbors keeping neighbors informed. Novel concept, we know.</p>

<p>Stay informed,<br>
The NeighborhoodOS Team</p>`
    },
    6: {
      subject: `Meet your neighbors (they're actually pretty cool)`,
      text: `${firstName},

Ever wonder who that person is you wave to every morning? Or which neighbor has the amazing garden you admire on walks?

${getDirectoryLink()}

The neighborhood directory helps you put names to faces and discover the interesting people living around you. Who knows - you might find your new favorite dog-walking buddy or discover someone who shares your obsession with sourdough starters.

Connecting neighbors, one introduction at a time,
The NeighborhoodOS Team`,
      html: `<p>${firstName},</p>

<p>Ever wonder who that person is you wave to every morning? Or which neighbor has the amazing garden you admire on walks?</p>

<p><a href="${getDirectoryLink()}">${getDirectoryLink()}</a></p>

<p>The neighborhood directory helps you put names to faces and discover the interesting people living around you. Who knows - you might find your new favorite dog-walking buddy or discover someone who shares your obsession with sourdough starters.</p>

<p>Connecting neighbors, one introduction at a time,<br>
The NeighborhoodOS Team</p>`
    },
    7: {
      subject: `Making ${neighborhoodName} work for everyone`,
      text: `Hey ${firstName},

Every neighborhood is different. Some love organizing elaborate holiday decorations, others just want to know when the garbage truck is running late.

${getModulesLink()}

Neighborhood modules let your community customize NeighborhoodOS for what matters to you. Think of it as the difference between a one-size-fits-all t-shirt and something actually tailored to fit.

Your neighborhood, your way,
The NeighborhoodOS Team`,
      html: `<p>Hey ${firstName},</p>

<p>Every neighborhood is different. Some love organizing elaborate holiday decorations, others just want to know when the garbage truck is running late.</p>

<p><a href="${getModulesLink()}">${getModulesLink()}</a></p>

<p>Neighborhood modules let your community customize NeighborhoodOS for what matters to you. Think of it as the difference between a one-size-fits-all t-shirt and something actually tailored to fit.</p>

<p>Your neighborhood, your way,<br>
The NeighborhoodOS Team</p>`
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

    // Get the email template for this step
    const template = getEmailTemplate(emailNumber, firstName, neighborhoodName);

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

    // Send the onboarding email
    const emailResponse = await resend.emails.send({
      from: "NeighborhoodOS <hello@neighborhoodos.com>",
      to: [recipientEmail],
      subject: template.subject,
      text: template.text,
      html: template.html,
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