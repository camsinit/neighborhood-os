
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Create a Supabase client with the service role key for admin permissions
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a logger for this function
const logger = createLogger('queue-onboarding-series');

/**
 * Interface for onboarding series request
 */
interface OnboardingSeriesRequest {
  userEmail: string;
  firstName: string;
  neighborhoodName: string;
  userId: string;
  neighborhoodId: string;
}

/**
 * Queue the complete 7-part onboarding email series
 * Called when a user completes onboarding after accepting an invite
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests using shared utility
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body
    const { 
      userEmail, 
      firstName, 
      neighborhoodName,
      userId,
      neighborhoodId
    }: OnboardingSeriesRequest = await req.json();

    // Validate required fields
    if (!userEmail || !firstName || !neighborhoodName || !userId || !neighborhoodId) {
      logger.error("Missing required fields in request");
      return errorResponse("Missing required fields: userEmail, firstName, neighborhoodName, userId, neighborhoodId", 400);
    }

    logger.info(`Queuing onboarding series for ${firstName} (${userEmail}) in ${neighborhoodName}`);

    // Create the 7-part email series with proper intervals
    const emailEntries = [];
    const now = new Date();

    for (let i = 1; i <= 7; i++) {
      const scheduledFor = new Date(now);
      
      // Schedule emails at increasing intervals:
      // Email 1: Immediate (0 days)
      // Email 2: 1 day
      // Email 3: 3 days  
      // Email 4: 7 days
      // Email 5: 14 days
      // Email 6: 21 days
      // Email 7: 30 days
      const dayOffsets = [0, 1, 3, 7, 14, 21, 30];
      scheduledFor.setDate(now.getDate() + dayOffsets[i - 1]);

      emailEntries.push({
        recipient_email: userEmail,
        template_type: 'onboarding_series',
        template_data: {
          firstName,
          neighborhoodName,
          emailNumber: i
        },
        scheduled_for: scheduledFor.toISOString(),
        neighborhood_id: neighborhoodId,
        user_id: userId
      });
    }

    // Insert all emails into the queue
    const { error } = await supabase
      .from('email_queue')
      .insert(emailEntries);

    if (error) {
      logger.error("Error queuing onboarding series:", error);
      throw error;
    }

    logger.info(`Successfully queued ${emailEntries.length} onboarding emails for ${firstName}`);

    return successResponse({
      emailCount: emailEntries.length
    }, "Onboarding series queued successfully");

  } catch (error: any) {
    logger.error("Error in queue-onboarding-series function:", error);
    return errorResponse(error.message || "Failed to queue onboarding series");
  }
};

serve(handler);
