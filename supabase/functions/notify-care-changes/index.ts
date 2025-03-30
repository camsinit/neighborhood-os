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
  action: 'update' | 'delete' | 'create' | 'confirm';
  careRequestTitle: string;
  userId: string;
  requestType?: 'need' | 'offer';
  neighborhoodId: string;
  changes?: string;
}

/**
 * Main handler function for the edge function
 * This processes care request events and updates the activity feed accordingly
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
      careRequestId, 
      action, 
      careRequestTitle, 
      userId,
      requestType,
      neighborhoodId,
      changes 
    } = await req.json() as UpdateRequest;

    console.log(`Processing ${action} notification for care request: ${careRequestTitle}`);

    // We only want to show activities for help requests and confirmations
    // Handle different actions
    switch (action) {
      case 'create':
        // Only create an activity if this is a request for help (not an offer)
        if (requestType === 'need') {
          // Create a new activity for this care request
          const { error: createError } = await supabaseClient
            .from('activities')
            .insert({
              title: careRequestTitle,
              activity_type: 'care_requested',
              content_id: careRequestId,
              content_type: 'care_requests',
              actor_id: userId,
              is_public: true,
              neighborhood_id: neighborhoodId,
              metadata: { description: changes }
            });

          if (createError) {
            console.error('Error creating activity:', createError);
            throw createError;
          } else {
            console.log(`Successfully created activity for care request: ${careRequestTitle}`);
          }
        }
        break;

      case 'confirm':
        // Create an activity when help has been provided/confirmed
        const { error: confirmError } = await supabaseClient
          .from('activities')
          .insert({
            title: `Help provided: ${careRequestTitle}`,
            activity_type: 'care_completed',
            content_id: careRequestId,
            content_type: 'care_requests',
            actor_id: userId,
            is_public: true,
            neighborhood_id: neighborhoodId,
            metadata: { description: "Help has been provided for this request" }
          });

        if (confirmError) {
          console.error('Error creating confirmation activity:', confirmError);
          throw confirmError;
        } else {
          console.log(`Successfully created help provided activity for: ${careRequestTitle}`);
        }
        break;

      case 'update':
        // Update any activities related to this care request to keep them in sync
        if (careRequestId) {
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
        break;
      
      case 'delete':
        // For future implementation - handle deletions appropriately
        // Currently we're just keeping the existing behavior
        console.log(`Care request deleted: ${careRequestTitle}`);
        break;
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
