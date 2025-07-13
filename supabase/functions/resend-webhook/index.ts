import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    console.log("[resend-webhook] Received webhook request");

    // Parse the webhook payload
    const webhookEvent: ResendWebhookEvent = await req.json();
    
    console.log(`[resend-webhook] Processing event: ${webhookEvent.type} for email: ${webhookEvent.data.email_id}`);

    // Validate required fields
    if (!webhookEvent.type || !webhookEvent.data?.email_id) {
      console.error("[resend-webhook] Invalid webhook payload - missing required fields");
      return new Response(
        JSON.stringify({ error: "Invalid webhook payload" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
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
        console.log(`[resend-webhook] Ignoring unsupported event type: ${webhookEvent.type}`);
        return new Response(
          JSON.stringify({ message: "Event type not supported" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    // Find and update the email in our queue
    const { data: existingEmail, error: fetchError } = await supabase
      .from('email_queue')
      .select('id, status')
      .eq('resend_email_id', webhookEvent.data.email_id)
      .single();

    if (fetchError || !existingEmail) {
      console.error(`[resend-webhook] Email not found for Resend ID: ${webhookEvent.data.email_id}`, fetchError);
      // Return 200 to acknowledge the webhook even if we can't find the email
      // This prevents Resend from retrying unnecessarily
      return new Response(
        JSON.stringify({ message: "Email not found, but webhook acknowledged" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
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
      console.error(`[resend-webhook] Error updating email status:`, updateError);
      throw updateError;
    }

    console.log(`[resend-webhook] Successfully updated email ${existingEmail.id} status from ${existingEmail.status} to ${newStatus}`);

    // Log additional actions based on status
    if (newStatus === 'bounced') {
      console.log(`[resend-webhook] Email bounced for recipient: ${webhookEvent.data.to.join(', ')}`);
      // TODO: Consider implementing bounce handling logic here
      // e.g., mark email as invalid, notify admin, etc.
    }

    if (newStatus === 'complained') {
      console.log(`[resend-webhook] Spam complaint received for recipient: ${webhookEvent.data.to.join(', ')}`);
      // TODO: Consider implementing complaint handling logic here
      // e.g., unsubscribe user, notify admin, etc.
    }

    return new Response(
      JSON.stringify({ 
        message: "Webhook processed successfully",
        email_id: webhookEvent.data.email_id,
        new_status: newStatus
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[resend-webhook] Error processing webhook:", error);
    
    // Return 500 for actual errors so Resend will retry
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);