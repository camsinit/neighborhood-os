
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateRequest {
  safetyUpdateId: string;
  action: 'update' | 'delete';
  safetyUpdateTitle: string;
  changes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Extract data from the request
    const { safetyUpdateId, action, safetyUpdateTitle, changes } = await req.json() as UpdateRequest;

    console.log(`Processing ${action} notification for safety update: ${safetyUpdateTitle}`);

    // When a safety update is modified, update any related activities to keep them in sync
    if (action === 'update' && safetyUpdateId) {
      // Update any activities related to this safety update
      // Now using safety_update_id column for more reliable joins
      const { error: activityError } = await supabaseClient
        .from('activities')
        .update({ title: safetyUpdateTitle })
        .eq('content_type', 'safety_updates')
        .eq('content_id', safetyUpdateId);

      if (activityError) {
        console.error('Error updating activities:', activityError);
        throw activityError;
      } else {
        console.log(`Successfully updated related activities for safety update: ${safetyUpdateTitle}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Safety update activities processed successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in notify-safety-changes:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

// Attach the handler to Deno's serve function
serve(handler);
