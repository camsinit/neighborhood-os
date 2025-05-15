
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Create a logger for this function
const logger = createLogger('notify-event-changes');

/**
 * DEPRECATED: This edge function is no longer needed as event notifications
 * are now handled by database triggers.
 * 
 * This function is kept for backward compatibility but does not perform
 * any actions. All notification creation is handled by database triggers:
 * - event_notification_trigger: Creates notifications for event creation/updates
 * - event_rsvp_notification_trigger: Creates notifications for RSVPs
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Log that this deprecated function was called
    logger.info('DEPRECATED: notify-event-changes was called but is no longer needed');
    const body = await req.json();
    
    // Just log what we received for debugging purposes
    logger.info('Received payload:', body);
    
    return successResponse(
      { status: "deprecated" },
      "This function is deprecated. Event notifications are now handled by database triggers."
    );
  } catch (error) {
    logger.error('Error in deprecated notify-event-changes function:', error);
    return errorResponse(error);
  }
};

serve(handler);
