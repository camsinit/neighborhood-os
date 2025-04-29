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
  userId?: string;
  neighborhoodId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { 
      safetyUpdateId, 
      action, 
      safetyUpdateTitle, 
      changes,
      userId,
      neighborhoodId 
    } = await req.json() as UpdateRequest;

    console.log(`[notify-safety-changes] Processing ${action} notification for safety update: ${safetyUpdateTitle}`);
    
    if (neighborhoodId) {
      console.log(`[notify-safety-changes] Neighborhood ID: ${neighborhoodId}`);
    }

    if (action === 'update' && safetyUpdateId) {
      const { error: activityError } = await supabaseClient
        .from('activities')
        .update({ title: safetyUpdateTitle })
        .eq('content_type', 'safety_updates')
        .eq('content_id', safetyUpdateId);

      if (activityError) {
        console.error('[notify-safety-changes] Error updating activities:', activityError);
        throw activityError;
      } else {
        console.log(`[notify-safety-changes] Successfully updated related activities for safety update: ${safetyUpdateTitle}`);
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
    console.error('[notify-safety-changes] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
