
// This edge function handles neighbor-related notifications 
// It creates activities and notifications for neighbor profile updates and joins
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Create a logger for this function
const logger = createLogger('notify-neighbor-changes');

// Create a Supabase client with the auth context of the function
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Main serve function for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body
    const { action, data } = await req.json();
    logger.info(`Processing neighbor notification: ${action}`, data);
    
    switch (action) {
      case "join_neighborhood":
        // Handle a new neighbor joining
        await handleNewNeighborJoin(data);
        break;
      case "profile_update":
        // Handle a neighbor updating their profile
        await handleProfileUpdate(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Return success response
    return successResponse(
      { action }, 
      "Notification processed"
    );
  } catch (error) {
    // Log the error for debugging
    logger.error("Error processing notification:", error);
    
    // Return error response
    return errorResponse(error);
  }
});

/**
 * Handle new neighbor joining the neighborhood
 */
async function handleNewNeighborJoin(data) {
  const { neighborhoodId, userId, neighborName } = data;
  
  logger.info(`Processing new neighbor join: ${neighborName}`);

  // Get neighborhood members to notify
  const { data: members, error } = await supabaseAdmin.rpc(
    "get_neighborhood_members_simple", 
    { neighborhood_uuid: neighborhoodId }
  );
  
  if (error) {
    logger.error(`Error getting neighborhood members:`, error);
    throw error;
  }
  
  logger.info(`Found ${members?.length || 0} members to notify`);
  
  // Create activity for the neighborhood feed
  const { data: activity, error: activityError } = await supabaseAdmin
    .from("activities")
    .insert({
      actor_id: userId,
      activity_type: "neighbor_joined",
      content_id: userId,
      content_type: "neighbors",
      neighborhood_id: neighborhoodId,
      title: `${neighborName} joined the neighborhood`,
      metadata: { 
        neighborName,
        action: "join"
      }
    })
    .select()
    .single();
    
  if (activityError) {
    logger.error(`Error creating activity:`, activityError);
    throw activityError;
  }
  
  logger.info(`Created activity: ${activity?.id}`);
  
  // Create notifications for each member (except the new neighbor)
  if (members && members.length > 0) {
    // Batch insert notifications
    const notifications = members
      .filter(memberId => memberId !== userId) // Don't notify the new neighbor
      .map(memberId => ({
        user_id: memberId,
        actor_id: userId,
        title: `${neighborName} joined your neighborhood`,
        content_type: "neighbors",
        content_id: userId,
        notification_type: "neighbor_welcome",
        action_type: "view",
        action_label: "View Profile", 
        relevance_score: 2, // Medium priority
        metadata: {
          neighborName,
          action: "join"
        }
      }));
      
    if (notifications.length > 0) {
      const { error: notifyError } = await supabaseAdmin
        .from("notifications")
        .insert(notifications);
        
      if (notifyError) {
        logger.error(`Error creating notifications:`, notifyError);
        throw notifyError;
      }
      
      logger.info(`Created ${notifications.length} notifications`);
    }
  }
}

/**
 * Handle a neighbor updating their profile
 */
async function handleProfileUpdate(data) {
  const { userId, neighborhoodId, neighborName, updatedFields } = data;
  
  logger.info(`Processing profile update for ${neighborName}`);

  // Only create notifications for significant profile updates
  const significantFields = ['avatar_url', 'display_name', 'bio', 'skills'];
  const hasSignificantUpdates = significantFields.some(field => updatedFields.includes(field));
  
  if (!hasSignificantUpdates) {
    logger.info(`No significant updates, skipping notifications`);
    return;
  }
  
  // Create activity for the neighborhood feed
  const { data: activity, error: activityError } = await supabaseAdmin
    .from("activities")
    .insert({
      actor_id: userId,
      activity_type: "profile_updated",
      content_id: userId,
      content_type: "neighbors",
      neighborhood_id: neighborhoodId,
      title: `${neighborName} updated their profile`,
      metadata: { 
        neighborName,
        updatedFields,
        action: "update"
      }
    })
    .select()
    .single();
    
  if (activityError) {
    logger.error(`Error creating activity:`, activityError);
    throw activityError;
  }
  
  logger.info(`Created activity: ${activity?.id}`);
  
  // For profile updates, we don't need to notify everyone in the neighborhood
  // Only create notifications for close connections (future enhancement)
}
