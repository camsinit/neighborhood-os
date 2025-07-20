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

// Process different email types - some use templates, others call specialized functions
async function processEmailByType(email: any): Promise<{success: boolean, messageId?: string, error?: string}> {
  const { template_type, template_data, recipient_email } = email;
  const { firstName, neighborhoodName, emailNumber } = template_data;
  
  switch (template_type) {
    case 'onboarding_series':
      try {
        // Call the specialized onboarding email function
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-onboarding-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            recipientEmail: recipient_email,
            firstName,
            neighborhoodName,
            emailNumber
          })
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Onboarding email function failed: ${errorData}`);
        }
        
        const result = await response.json();
        return { success: true, messageId: result.messageId };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    
    case 'welcome':
      try {
        // Call the specialized welcome email function
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-welcome-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            recipientEmail: recipient_email,
            firstName,
            neighborhoodName
          })
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Welcome email function failed: ${errorData}`);
        }
        
        const result = await response.json();
        return { success: true, messageId: result.messageId };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    
    default:
      // For other email types, use simple template
      const template = getSimpleEmailTemplate(template_type, template_data);
      
      try {
        const emailResponse = await resend.emails.send({
          from: "NeighborhoodOS <hello@updates.neighborhoodos.com>",
          to: [recipient_email],
          subject: template.subject,
          text: template.text,
          html: template.html,
        });

        if (emailResponse.error) {
          throw new Error(`Resend API error: ${emailResponse.error.message}`);
        }

        return { success: true, messageId: emailResponse.data?.id };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
  }
}

// Simple template function for basic email types
function getSimpleEmailTemplate(templateType: string, templateData: any): EmailTemplate {
  const { firstName, neighborhoodName } = templateData;
  
  switch (templateType) {
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

        // Process the email based on its type
        const result = await processEmailByType(email);

        if (!result.success) {
          throw new Error(result.error || 'Email processing failed');
        }

        // Update email status to sent
        const { error: updateError } = await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            resend_email_id: result.messageId || null,
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