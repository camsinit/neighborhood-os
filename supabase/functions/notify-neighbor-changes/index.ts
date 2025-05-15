
// This edge function handles neighbor-related notifications 
// It creates activities and notifications for neighbor profile updates and joins
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// Define CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Create a Supabase client with the auth context of the function
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Main serve function for the edge function
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse the request body
    const { action, data } = await req.json();
    console.log(`Processing neighbor notification: ${action}`, data);

    // Generate a unique transaction ID for tracing
    const transactionId = crypto.randomUUID().substring(0, 8);
    
    switch (action) {
      case "join_neighborhood":
        // Handle a new neighbor joining
        await handleNewNeighborJoin(data, transactionId);
        break;
      case "profile_update":
        // Handle a neighbor updating their profile
        await handleProfileUpdate(data, transactionId);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "Notification processed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    // Log the error for debugging
    console.error("Error processing notification:", error.message);
    
    // Return error response
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/**
 * Handle new neighbor joining the neighborhood
 */
async function handleNewNeighborJoin(data, transactionId) {
  const { neighborhoodId, userId, neighborName } = data;
  
  console.log(`[${transactionId}] Processing new neighbor join: ${neighborName}`);

  // Get neighborhood members to notify
  const { data: members, error } = await supabaseAdmin.rpc(
    "get_neighborhood_members_simple", 
    { neighborhood_uuid: neighborhoodId }
  );
  
  if (error) {
    console.error(`[${transactionId}] Error getting neighborhood members:`, error);
    throw error;
  }
  
  console.log(`[${transactionId}] Found ${members?.length || 0} members to notify`);
  
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
    console.error(`[${transactionId}] Error creating activity:`, activityError);
    throw activityError;
  }
  
  console.log(`[${transactionId}] Created activity: ${activity?.id}`);
  
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
        console.error(`[${transactionId}] Error creating notifications:`, notifyError);
        throw notifyError;
      }
      
      console.log(`[${transactionId}] Created ${notifications.length} notifications`);
    }
  }
}

/**
 * Handle a neighbor updating their profile
 */
async function handleProfileUpdate(data, transactionId) {
  const { userId, neighborhoodId, neighborName, updatedFields } = data;
  
  console.log(`[${transactionId}] Processing profile update for ${neighborName}`);

  // Only create notifications for significant profile updates
  const significantFields = ['avatar_url', 'display_name', 'bio', 'skills'];
  const hasSignificantUpdates = significantFields.some(field => updatedFields.includes(field));
  
  if (!hasSignificantUpdates) {
    console.log(`[${transactionId}] No significant updates, skipping notifications`);
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
    console.error(`[${transactionId}] Error creating activity:`, activityError);
    throw activityError;
  }
  
  console.log(`[${transactionId}] Created activity: ${activity?.id}`);
  
  // For profile updates, we don't need to notify everyone in the neighborhood
  // Only create notifications for close connections (future enhancement)
}
