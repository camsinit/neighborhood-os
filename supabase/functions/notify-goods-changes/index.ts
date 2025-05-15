
// Follow Deno's ESM imports pattern
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Create a logger for this function
const logger = createLogger('notify-goods-changes');

// Type for request body
interface GoodsChangeNotificationPayload {
  goodsItemId: string;
  action: 'create' | 'update' | 'delete';
  goodsItemTitle: string;
  userId: string;
  requestType: 'offer' | 'need';
  neighborhoodId: string;
  category?: string;
  urgency?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Create a Supabase client for the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Parse the JSON request body
    const body: GoodsChangeNotificationPayload = await req.json();
    
    // Log the received payload for debugging
    logger.info("Received notification payload:", {
      goodsItemId: body.goodsItemId,
      action: body.action,
      title: body.goodsItemTitle,
      requestType: body.requestType,
      category: body.category,
      urgency: body.urgency
    });
    
    // Extract parameters
    const { 
      goodsItemId, 
      action, 
      goodsItemTitle, 
      userId, 
      requestType, 
      neighborhoodId, 
      category, 
      urgency 
    } = body;
    
    // Validate required parameters
    if (!goodsItemId || !action || !userId || !neighborhoodId) {
      logger.error("Missing required parameters", { body });
      return errorResponse('Missing required parameters', 400);
    }

    // Define what activity type to create based on request type
    const activityType = requestType === 'offer' ? 'good_shared' : 'good_requested';
    
    // Create activity entry for this goods item
    if (action === 'create') {
      const { error: activityError } = await supabaseClient
        .from('activities')
        .insert({
          actor_id: userId,
          activity_type: activityType,
          content_id: goodsItemId,
          content_type: 'goods_exchange',
          title: goodsItemTitle,
          neighborhood_id: neighborhoodId,
          metadata: {
            category,
            request_type: requestType,
            urgency
          }
        });
      
      if (activityError) {
        logger.error("Error creating activity:", activityError);
        throw activityError;
      }
      
      logger.info(`Successfully created activity for goods item: ${goodsItemId}`);
    }
    
    // Return a success response
    return successResponse(
      { action, requestType }, 
      `Successfully processed ${action} for ${requestType}`
    );
    
  } catch (error) {
    // Log and return any errors
    logger.error("Error processing goods change:", error);
    return errorResponse(error);
  }
});
