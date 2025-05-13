import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  eventId: string;
  action: 'update' | 'delete' | 'rsvp';
  eventTitle: string;
  changes?: string;
  userId?: string; // Added for RSVPs
  hostId?: string; // Added for RSVPs
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_ANON_KEY');
      throw new Error('Server configuration error');
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    const requestBody = await req.json();
    const { eventId, action, eventTitle, changes, userId, hostId } = requestBody as EmailRequest;

    console.log(`Processing ${action} notification for event: ${eventTitle}`);

    // Handle different action types
    if (action === 'rsvp' && userId && hostId && userId !== hostId) {
      // Create notification for the host when someone RSVPs
      console.log(`Creating RSVP notification: User ${userId} RSVP'd to event ${eventTitle} hosted by ${hostId}`);
      
      const { data: notification, error: notificationError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: hostId, // Send to the host
          actor_id: userId, // From the person who RSVP'd
          title: `New RSVP for your event: ${eventTitle}`,
          content_type: 'events',
          content_id: eventId,
          notification_type: 'event',
          action_type: 'rsvp',
          action_label: 'View Attendee',
          relevance_score: 3, // High relevance: direct involvement
          metadata: { 
            type: 'event_rsvp',
            eventId
          }
        })
        .select();

      if (notificationError) {
        console.error('Error creating RSVP notification:', notificationError);
        throw notificationError;
      } else {
        console.log(`Successfully created RSVP notification:`, notification);
      }
    }
    // Original email notification code for updates/deletes
    else if (action === 'update' || action === 'delete') {
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

      // For now, log the users who would receive email notifications
      if (usersToNotify.length > 0) {
        console.log(`Would send emails to users:`, usersToNotify.map(rsvp => rsvp.profiles?.username));
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Notification processed successfully for ${action}`
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
