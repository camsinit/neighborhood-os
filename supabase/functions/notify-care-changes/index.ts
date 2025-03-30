import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers to allow cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define the expected request structure
interface UpdateRequest {
  careRequestId: string;
  action: 'update' | 'delete';
  careRequestTitle: string;
  changes?: string;
}

// Main handler function for the edge function
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
    const { careRequestId, action, careRequestTitle, changes } = await req.json() as UpdateRequest;

    console.log(`Processing ${action} notification for care request: ${careRequestTitle}`);

    // When a care request is modified, update any related activities to keep them in sync
    if (action === 'update' && careRequestId) {
      // Update any activities related to this care request
      const { error: activityError } = await supabaseClient
        .from('activities')
        .update({ title: careRequestTitle })
        .eq('content_type', 'care_requests')
        .eq('content_id', careRequestId);

      if (activityError) {
        console.error('Error updating activities:', activityError);
        throw activityError;
      } else {
        console.log(`Successfully updated related activities for care request: ${careRequestTitle}`);
      }
    }

    // Return a success response
    return new Response(JSON.stringify({ 
      success: true,
      message: `Care request activities processed successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Log and return any errors
    console.error('Error in notify-care-changes:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

// Attach the handler to Deno's serve function
serve(handler);
