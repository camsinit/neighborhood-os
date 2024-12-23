import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  eventId: string;
  action: 'update' | 'delete';
  eventTitle: string;
  changes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { eventId, action, eventTitle, changes } = await req.json() as EmailRequest;

    // Get all RSVPs for this event
    const { data: rsvps, error: rsvpError } = await supabaseClient
      .from('event_rsvps')
      .select(`
        user_id,
        profiles (
          id,
          email
        )
      `)
      .eq('event_id', eventId);

    if (rsvpError) throw rsvpError;

    const emailPromises = rsvps.map(async (rsvp) => {
      const emailContent = action === 'delete'
        ? `The event "${eventTitle}" has been cancelled.`
        : `The event "${eventTitle}" has been updated. Changes: ${changes}`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Community Calendar <onboarding@resend.dev>",
          to: [rsvp.profiles.email],
          subject: action === 'delete' ? "Event Cancelled" : "Event Updated",
          html: `<p>${emailContent}</p>`,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to send email: ${await res.text()}`);
      }
    });

    await Promise.all(emailPromises);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);