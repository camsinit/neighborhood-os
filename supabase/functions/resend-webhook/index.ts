
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Create a logger for this function
const logger = createLogger('resend-webhook');

/**
 * Resend Webhook Handler
 * 
 * This function receives webhook notifications from Resend about email delivery status.
 * Supported events: email.delivered, email.bounced, email.complained
 */

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    to: string[];
    from: string;
    subject: string;
    created_at: string;
    // Additional fields may be present depending on event type
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    logger.info("Received webhook request");

    // Parse the webhook payload
    const webhookEvent: ResendWebhookEvent = await req.json();
    
    logger.info(`Processing event: ${webhookEvent.type} for email: ${webhookEvent.data.email_id}`);

    // Validate required fields
    if (!webhookEvent.type || !webhookEvent.data?.email_id) {
      logger.error("Invalid webhook payload - missing required fields");
      return errorResponse("Invalid webhook payload", 400);
    }

    // Map Resend event types to our email queue statuses
    let newStatus: string;
    
    switch (webhookEvent.type) {
      case 'email.delivered':
        newStatus = 'delivered';
        break;
      case 'email.bounced':
        newStatus = 'bounced';
        break;
      case 'email.complained':
        newStatus = 'complained';
        break;
      default:
        logger.info(`Ignoring unsupported event type: ${webhookEvent.type}`);
        return successResponse(null, "Event type not supported");
    }

    // Find and update the email in our queue
    const { data: existingEmail, error: fetchError } = await supabase
      .from('email_queue')
      .select('id, status')
      .eq('resend_email_id', webhookEvent.data.email_id)
      .single();

    if (fetchError || !existingEmail) {
      logger.error(`Email not found for Resend ID: ${webhookEvent.data.email_id}`, fetchError);
      // Return 200 to acknowledge the webhook even if we can't find the email
      // This prevents Resend from retrying unnecessarily
      return successResponse(null, "Email not found, but webhook acknowledged");
    }

    // Update the email status
    const { error: updateError } = await supabase
      .from('email_queue')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('resend_email_id', webhookEvent.data.email_id);

    if (updateError) {
      logger.error(`Error updating email status:`, updateError);
      throw updateError;
    }

    logger.info(`Successfully updated email ${existingEmail.id} status from ${existingEmail.status} to ${newStatus}`);

    // Log additional actions based on status
    if (newStatus === 'bounced') {
      logger.info(`Email bounced for recipient: ${webhookEvent.data.to.join(', ')}`);
      // TODO: Consider implementing bounce handling logic here
      // e.g., mark email as invalid, notify admin, etc.
    }

    if (newStatus === 'complained') {
      logger.info(`Spam complaint received for recipient: ${webhookEvent.data.to.join(', ')}`);
      // TODO: Consider implementing complaint handling logic here
      // e.g., unsubscribe user, notify admin, etc.
    }

    return successResponse({
      email_id: webhookEvent.data.email_id,
      new_status: newStatus
    }, "Webhook processed successfully");

  } catch (error: any) {
    logger.error("Error processing webhook:", error);
    
    // Return 500 for actual errors so Resend will retry
    return errorResponse(error.message);
  }
};

serve(handler);
