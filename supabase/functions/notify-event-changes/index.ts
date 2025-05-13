import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  eventId: string;
  action: 'update' | 'delete' | 'rsvp';  // Added 'rsvp' action type
  eventTitle: string;
  changes?: string;
  userId?: string;  // Added userId for RSVP actions
  hostId?: string;  // Added hostId for RSVP notifications
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

    const { eventId, action, eventTitle, changes, userId, hostId } = await req.json() as EmailRequest;

    console.log(`Processing ${action} notification for event: ${eventTitle}`);

    // For RSVP actions, create a notification for the host
    if (action === 'rsvp' && eventId && hostId && userId) {
      console.log(`Creating RSVP notification: User ${userId} RSVP'd to ${eventTitle} hosted by ${hostId}`);
      
      // Only notify if the RSVP user is not the host
      if (userId !== hostId) {
        try {
          // Insert direct notification to the host about the new RSVP
          const { data: notifData, error: notifError } = await supabaseClient
            .from('notifications')
            .insert({
              user_id: hostId,                    // Notification recipient (host)
              actor_id: userId,                   // Person who performed the action (RSVP user)
              title: `New RSVP for ${eventTitle}`,
              content_type: 'events',
              content_id: eventId,
              notification_type: 'event',
              action_type: 'view',
              action_label: 'View Event',
              relevance_score: 3,                 // High relevance: direct involvement
              metadata: { 
                type: 'rsvp', 
                event_id: eventId,
                event_title: eventTitle
              }
            });
            
          if (notifError) {
            console.error('Error creating RSVP notification:', notifError);
            throw notifError;
          }
          
          console.log('Successfully created RSVP notification:', notifData);
        } catch (error) {
          console.error('Failed to create RSVP notification:', error);
        }
      } else {
        console.log('Skipping notification - user RSVP\'d to their own event');
      }
    }

    // Get the current user ID
    const { data: { user } } = await supabaseClient.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      console.warn("[fetchEventNotifications] No authenticated user found");
      return { data: [], error: null };
    }

    // Log the fetch attempt for debugging
    console.log(`[fetchEventNotifications] Fetching events for user ${userId}, showArchived=${showArchived}`);
    
    // First, fetch events the user created (as host)
    const hostEventsPromise = supabaseClient.from("events").select(`
      id, 
      title, 
      created_at, 
      is_read, 
      is_archived,
      profiles:host_id (
        display_name,
        avatar_url
      )
    `)
    .eq('host_id', userId)
    .eq('is_archived', showArchived)
    .order("created_at", { ascending: false });
    
    // Second, fetch events the user has RSVP'd to
    const rsvpEventsPromise = supabaseClient.from("event_rsvps")
      .select(`
        event_id,
        events!inner (
          id, 
          title, 
          created_at, 
          is_read, 
          is_archived,
          profiles:host_id (
            display_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .eq('events.is_archived', showArchived)
      .order("created_at", { ascending: false });

    // Execute both queries concurrently
    const [hostEventsResult, rsvpEventsResult] = await Promise.all([
      hostEventsPromise,
      rsvpEventsPromise
    ]);
    
    // Extract just the events from the RSVP result
    const rsvpEvents = rsvpEventsResult.data?.map(item => item.events) || [];
    
    // Combine both sets of events
    const allEvents = [
      ...(hostEventsResult.data || []),
      ...rsvpEvents
    ];
    
    // Remove duplicates (in case user both hosts and RSVPs to same event)
    const uniqueEvents = Array.from(
      new Map(allEvents.map(event => [event.id, event])).values()
    );
    
    // Log the result for debugging
    console.log(`[fetchEventNotifications] Found ${uniqueEvents.length} relevant events`);

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

    return new Response(JSON.stringify({ 
      success: true,
      message: `Notification processed for event: ${eventTitle}`
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
