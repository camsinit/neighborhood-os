
// **DEPRECATED**: This edge function is now deprecated as the functionality has been
// moved to a database trigger (create_goods_notification).
// The function is kept for backward compatibility but will be removed in a future version.

// Follow Deno's ESM imports pattern
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    // Log the request
    logger.info("DEPRECATED: This function is now deprecated. Notifications are handled by database triggers.");
    
    // Parse the JSON request body
    const body: GoodsChangeNotificationPayload = await req.json();
    
    // Log the received payload for debugging
    logger.info("Received notification payload (DEPRECATED):", {
      goodsItemId: body.goodsItemId,
      action: body.action,
      title: body.goodsItemTitle
    });
    
    // Return a success response
    return successResponse(
      { status: "deprecated" }, 
      "This function is deprecated. Notifications are now handled by database triggers."
    );
    
  } catch (error) {
    // Log and return any errors
    logger.error("Error in deprecated goods-changes function:", error);
    return errorResponse(error);
  }
});
