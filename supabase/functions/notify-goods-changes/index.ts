
// Follow Deno's ESM imports pattern
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
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
    console.log("Received notification payload:", {
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
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
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
        console.error("Error creating activity:", activityError);
        throw activityError;
      }
      
      console.log(`Successfully created activity for goods item: ${goodsItemId}`);
    }
    
    // Return a success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${action} for ${requestType}` 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
    
  } catch (error) {
    // Log and return any errors
    console.error("Error processing goods change:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
