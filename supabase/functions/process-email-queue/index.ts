
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create a logger for this function
const logger = createLogger('process-email-queue');

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Fetch pending emails from the queue
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10); // Process up to 10 emails at a time

    if (fetchError) {
      logger.error('Error fetching emails:', fetchError);
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      logger.info('No pending emails found');
      return successResponse({ processed: 0 }, 'No pending emails to process');
    }

    logger.info(`Found ${pendingEmails.length} pending emails`);

    let successCount = 0;
    let errorCount = 0;

    // Process each email
    for (const emailRecord of pendingEmails) {
      const { id, recipient_email, template } = emailRecord;
      
      try {
        const emailResponse = await resend.emails.send({
          from: "neighborhoodOS <hello@updates.neighborhoodos.com>",
          to: [recipient_email],
          subject: template.subject,
          text: template.text,
          html: template.html,
        });

        // Mark as sent
        await supabase
          .from('email_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
            resend_id: emailResponse.data?.id 
          })
          .eq('id', id);

        successCount++;
        logger.info(`Email ${id} sent successfully`);

      } catch (emailError: any) {
        logger.error(`Error sending email ${id}:`, emailError);
        
        // Mark as failed with error details
        await supabase
          .from('email_queue')
          .update({ 
            status: 'failed',
            error_message: emailError.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        errorCount++;
      }
    }

    logger.info(`Processing complete. Success: ${successCount}, Errors: ${errorCount}`);

    return successResponse({
      processed: pendingEmails.length,
      successful: successCount,
      failed: errorCount
    }, 'Email processing complete');

  } catch (error: any) {
    logger.error('Critical error:', error);
    return errorResponse('Failed to process email queue');
  }
};

serve(handler);
