import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Create a logger for this function
const logger = createLogger('notify-event-changes');

// Get the Resend API key from environment variables
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface EmailRequest {
  eventId: string;
  action: 'update' | 'delete';
  eventTitle: string;
  changes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { eventId, action, eventTitle, changes } = await req.json() as EmailRequest;

    logger.info(`Processing ${action} notification for event: ${eventTitle}`);

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
      logger.error('Error fetching RSVPs:', rsvpError);
      throw rsvpError;
    }

    logger.info(`Found ${rsvps?.length || 0} RSVPs to notify`);

    // Filter users who have email notifications enabled
    const usersToNotify = rsvps?.filter(rsvp => 
      rsvp.profiles?.notification_preferences?.email === true
    ) || [];

    logger.info(`${usersToNotify.length} users have email notifications enabled`);

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
          logger.error('Error updating activities:', activityError);
        } else {
          logger.info(`Successfully updated related activities for event: ${eventTitle}`);
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
          logger.error('Error updating activities for deleted event:', activityError);
        } else {
          logger.info(`Successfully marked activities as deleted for event: ${eventTitle}`);
        }
      }
    }

    if (usersToNotify.length === 0) {
      return successResponse(
        { notificationCount: 0 },
        "No users to notify"
      );
    }

    // For now, we'll skip actual email sending since we don't have email addresses
    // but log the attempt for debugging
    logger.info(`Would send emails to users:`, usersToNotify.map(rsvp => rsvp.profiles?.username));

    return successResponse(
      { 
        notificationCount: usersToNotify.length,
        action,
        eventId
      },
      `Notification processed for ${usersToNotify.length} users`
    );
  } catch (error) {
    logger.error('Error in notify-event-changes:', error);
    return errorResponse(error);
  }
};

serve(handler);
