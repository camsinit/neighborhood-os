import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('[process-email-queue] Starting email queue processing');

const handler = async (req: Request): Promise<Response> => {
  try {
    // Fetch pending emails from the queue
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10); // Process up to 10 emails at a time

    if (fetchError) {
      console.error('[process-email-queue] Error fetching emails:', fetchError);
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('[process-email-queue] No pending emails found');
      return new Response(JSON.stringify({ 
        message: 'No pending emails to process',
        processed: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[process-email-queue] Found ${pendingEmails.length} pending emails`);

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
        console.log(`[process-email-queue] Email ${id} sent successfully`);

      } catch (emailError: any) {
        console.error(`[process-email-queue] Error sending email ${id}:`, emailError);
        
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

    console.log(`[process-email-queue] Processing complete. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({ 
      message: 'Email processing complete',
      processed: pendingEmails.length,
      successful: successCount,
      failed: errorCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[process-email-queue] Critical error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process email queue',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
