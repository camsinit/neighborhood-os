import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

// Initialize clients
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Email Queue Processor
 * 
 * This function processes pending emails from the email_queue table.
 * It can be called manually or via cron to send scheduled emails.
 */

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

// Get email template based on type
function getEmailTemplate(templateType: string, templateData: any): EmailTemplate {
  const { firstName, neighborhoodName } = templateData;
  
  switch (templateType) {
    case 'welcome':
      return {
        subject: `Welcome to ${neighborhoodName}!`,
        text: `Hi ${firstName}!\n\nWelcome to ${neighborhoodName}! We're excited to have you join our neighborhood community.\n\nBest regards,\nThe NeighborhoodOS Team`,
        html: `
          <h1>Welcome to ${neighborhoodName}!</h1>
          <p>Hi ${firstName}!</p>
          <p>Welcome to ${neighborhoodName}! We're excited to have you join our neighborhood community.</p>
          <p>Best regards,<br>The NeighborhoodOS Team</p>
        `
      };
    
    case 'onboarding_1':
      return {
        subject: `Getting Started with ${neighborhoodName}`,
        text: `Hi ${firstName}!\n\nThis is the first email in your onboarding series for ${neighborhoodName}.\n\nBest regards,\nThe NeighborhoodOS Team`,
        html: `
          <h1>Getting Started with ${neighborhoodName}</h1>
          <p>Hi ${firstName}!</p>
          <p>This is the first email in your onboarding series for ${neighborhoodName}.</p>
          <p>Best regards,<br>The NeighborhoodOS Team</p>
        `
      };
    
    // Add more onboarding templates as needed
    default:
      return {
        subject: `Update from ${neighborhoodName}`,
        text: `Hi ${firstName}!\n\nWe have an update for you from ${neighborhoodName}.\n\nBest regards,\nThe NeighborhoodOS Team`,
        html: `
          <h1>Update from ${neighborhoodName}</h1>
          <p>Hi ${firstName}!</p>
          <p>We have an update for you from ${neighborhoodName}.</p>
          <p>Best regards,<br>The NeighborhoodOS Team</p>
        `
      };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[process-email-queue] Starting email queue processing");

    // Get pending emails that are ready to be sent
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('retry_count', 3) // Don't retry emails that have failed too many times
      .order('scheduled_for', { ascending: true })
      .limit(10); // Process 10 emails at a time

    if (fetchError) {
      console.error("[process-email-queue] Error fetching emails:", fetchError);
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log("[process-email-queue] No pending emails found");
      return new Response(
        JSON.stringify({ message: "No pending emails found", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[process-email-queue] Found ${pendingEmails.length} pending emails`);

    let successCount = 0;
    let failureCount = 0;

    // Process each email
    for (const email of pendingEmails) {
      try {
        console.log(`[process-email-queue] Processing email ${email.id} of type ${email.template_type}`);

        // Get the email template
        const template = getEmailTemplate(email.template_type, email.template_data);

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: "NeighborhoodOS <noreply@neighborhoodos.com>",
          to: [email.recipient_email],
          subject: template.subject,
          text: template.text,
          html: template.html,
        });

        if (emailResponse.error) {
          throw new Error(`Resend API error: ${emailResponse.error.message}`);
        }

        // Update email status to sent
        const { error: updateError } = await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            resend_email_id: emailResponse.data?.id || null,
            error_message: null
          })
          .eq('id', email.id);

        if (updateError) {
          console.error(`[process-email-queue] Error updating email ${email.id}:`, updateError);
          throw updateError;
        }

        console.log(`[process-email-queue] Successfully sent email ${email.id}`);
        successCount++;

      } catch (error) {
        console.error(`[process-email-queue] Error processing email ${email.id}:`, error);
        
        // Update email with error and increment retry count
        const { error: updateError } = await supabase
          .from('email_queue')
          .update({
            status: email.retry_count >= email.max_retries - 1 ? 'failed' : 'pending',
            retry_count: email.retry_count + 1,
            error_message: error instanceof Error ? error.message : 'Unknown error',
            // Schedule retry in 1 hour if we haven't exceeded max retries
            scheduled_for: email.retry_count >= email.max_retries - 1 
              ? email.scheduled_for 
              : new Date(Date.now() + 60 * 60 * 1000).toISOString()
          })
          .eq('id', email.id);

        if (updateError) {
          console.error(`[process-email-queue] Error updating failed email ${email.id}:`, updateError);
        }

        failureCount++;
      }
    }

    const result = {
      message: "Email queue processing completed",
      processed: pendingEmails.length,
      successful: successCount,
      failed: failureCount
    };

    console.log("[process-email-queue] Processing completed:", result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[process-email-queue] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);