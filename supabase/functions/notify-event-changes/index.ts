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

    console.log(`Processing ${action} notification for event: ${eventTitle}`);

    // Get all RSVPs for this event along with user profiles
    // Use explicit table aliases to avoid ambiguous column references
    const { data: rsvps, error: rsvpError } = await supabaseClient
      .from('event_rsvps as er')  // Add table alias
      .select(`
        er.user_id,
        profiles:er.user_id (  // Use table alias in the join
          id,
          username,
          notification_preferences
        )
      `)
      .eq('er.event_id', eventId);  // Use table alias for the column reference

    if (rsvpError) {
      console.error('Error fetching RSVPs:', rsvpError);
      throw rsvpError;
    }

    console.log(`Found ${rsvps?.length || 0} RSVPs to notify`);

    // Filter users who have email notifications enabled
    const usersToNotify = rsvps?.filter(rsvp => 
      rsvp.profiles?.notification_preferences?.email === true
    ) || [];

    console.log(`${usersToNotify.length} users have email notifications enabled`);

    // When an event is updated or deleted, also update any related activities to keep them in sync
    // Using event_id for more reliable activity updates
    if (eventId) {
      if (action === 'update') {
        // Update any activities related to this event
        const { error: activityError } = await supabaseClient
          .from('activities')
          .update({ title: eventTitle })
          .eq('content_type', 'events')
          .eq('content_id', eventId);

        if (activityError) {
          console.error('Error updating activities:', activityError);
        } else {
          console.log(`Successfully updated related activities for event: ${eventTitle}`);
        }
      } else if (action === 'delete') {
        // For deleted events, update the metadata in activities to indicate the content is deleted
        const { error: activityError } = await supabaseClient
          .from('activities')
          .update({ 
            metadata: {
              deleted: true,
              original_title: eventTitle
            }
          })
          .eq('content_type', 'events')
          .eq('content_id', eventId);

        if (activityError) {
          console.error('Error updating activities for deleted event:', activityError);
        } else {
          console.log(`Successfully marked activities as deleted for event: ${eventTitle}`);
        }
      }
    }

    if (usersToNotify.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No users to notify" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For now, we'll skip actual email sending since we don't have email addresses
    // but log the attempt for debugging
    console.log(`Would send emails to users:`, usersToNotify.map(rsvp => rsvp.profiles?.username));

    return new Response(JSON.stringify({ 
      success: true,
      message: `Notification processed for ${usersToNotify.length} users`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in notify-event-changes:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
