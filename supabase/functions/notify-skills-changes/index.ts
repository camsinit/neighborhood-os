import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers to allow cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define the expected request structure
interface UpdateRequest {
  skillId: string;
  action: 'update' | 'delete' | 'request';
  skillTitle: string;
  changes?: string;
  providerId?: string;
  requesterId?: string;
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
    const { skillId, action, skillTitle, changes, providerId, requesterId } = await req.json() as UpdateRequest;

    console.log(`[notify-skills-changes] Processing ${action} notification for skill: ${skillTitle}`);

    // When a skill is modified, update any related activities to keep them in sync
    if (action === 'update' && skillId) {
      // Update any activities related to this skill
      const { error: activityError } = await supabaseClient
        .from('activities')
        .update({ title: skillTitle })
        .eq('content_type', 'skills_exchange')
        .eq('content_id', skillId);

      if (activityError) {
        console.error('[notify-skills-changes] Error updating activities:', activityError);
        throw activityError;
      } else {
        console.log(`[notify-skills-changes] Successfully updated related activities for skill: ${skillTitle}`);
      }
    }

    // Handle skill request notifications
    if (action === 'request' && skillId && providerId && requesterId) {
      console.log(`[notify-skills-changes] Creating notification for skill request: providerId=${providerId}, requesterId=${requesterId}`);
      
      // Create a notification for the provider
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: providerId,
          actor_id: requesterId,
          title: `New request for your skill: ${skillTitle}`,
          content_type: 'skill_request',
          content_id: skillId,
          notification_type: 'skills',
          action_type: 'view',
          action_label: 'View Request',
          metadata: {
            skillId,
            requesterId
          }
        });
        
      if (notificationError) {
        console.error('[notify-skills-changes] Error creating notification:', notificationError);
        throw notificationError;
      } else {
        console.log('[notify-skills-changes] Successfully created notification for provider');
      }
    }

    // Return a success response
    return new Response(JSON.stringify({ 
      success: true,
      message: `Skill activities processed successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Log and return any errors
    console.error('[notify-skills-changes] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

// Attach the handler to Deno's serve function
serve(handler);
