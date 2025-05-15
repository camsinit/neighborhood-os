
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Create a logger for this function
const logger = createLogger('notify-safety-changes');

// This edge function is now deprecated - safety notifications are created by database triggers
serve(async (req: Request) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  logger.info("Safety notification edge function called - now deprecated as notifications are created by DB triggers");
  
  return successResponse(
    { success: true },
    "Safety notifications are now handled by database triggers"
  );
});
