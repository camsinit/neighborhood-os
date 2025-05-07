
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers to allow cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define the expected request structure
interface UpdateRequest {
  goodsItemId: string;
  action: 'update' | 'delete' | 'create';
  goodsItemTitle: string;
  userId: string;
  requestType: 'offer' | 'request';
  neighborhoodId: string;
  urgency?: string;
  category?: string;
}

/**
 * Main handler function for the edge function
 * This processes goods exchange events and updates the activity feed accordingly
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with admin privileges using environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Extract data from the request body
    const { 
      goodsItemId, 
      action, 
      goodsItemTitle, 
      userId,
      requestType,
      neighborhoodId,
      urgency,
      category
    } = await req.json() as UpdateRequest;

    // Only create activities for new items or significant updates
    if (action === 'create') {
      const activityType = requestType === 'offer' ? 'good_shared' : 'good_requested';
      
      // Now using goods_item_id for activity creation for better consistency
      const { error: createError } = await supabaseClient
        .from('activities')
        .insert({
          title: goodsItemTitle,
          activity_type: activityType,
          content_id: goodsItemId,
          content_type: 'goods_exchange',
          actor_id: userId,
          is_public: true,
          neighborhood_id: neighborhoodId,
          metadata: { 
            urgency, 
            category
          }
        });

      if (createError) {
        console.error('Error creating activity:', createError);
        throw createError;
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Goods exchange activities processed successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in notify-goods-changes:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
