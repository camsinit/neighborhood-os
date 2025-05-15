import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SafetyRequest {
  safetyUpdateId: string;
  action: 'create' | 'update' | 'delete' | 'comment';
  safetyUpdateTitle: string;
  commentId?: string;
  commentContent?: string;
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
    const { 
      safetyUpdateId, 
      action, 
      safetyUpdateTitle,
      commentId,
      commentContent
    } = await req.json() as SafetyRequest;

    console.log(`Processing ${action} notification for safety update: ${safetyUpdateTitle}`);

    // Get safety update details
    const { data: safetyUpdate, error: safetyError } = await supabaseClient
      .from('safety_updates')
      .select('author_id, neighborhood_id')
      .eq('id', safetyUpdateId)
      .single();

    if (safetyError) {
      console.error('Error fetching safety update:', safetyError);
      throw safetyError;
    }

    // Handle different types of actions
    if (action === 'comment' && commentId) {
      // Process comment notification
      if (commentContent && safetyUpdate.author_id) {
        // Get commenter info
        const { data: userData } = await supabaseClient.auth.getUser();
        const currentUserId = userData.user?.id;

        // Don't create notifications for self-comments
        if (currentUserId !== safetyUpdate.author_id) {
          // Create notification for safety update author
          await supabaseClient.rpc('create_unified_system_notification', {
            p_user_id: safetyUpdate.author_id,
            p_actor_id: currentUserId,
            p_title: `New comment on your safety update: ${safetyUpdateTitle}`,
            p_content_type: 'safety_comment',
            p_content_id: commentId,
            p_notification_type: 'safety',
            p_action_type: 'view',
            p_action_label: 'View Comment',
            p_relevance_score: 3, // High importance
            p_metadata: {
              safety_update_id: safetyUpdateId,
              comment_preview: commentContent?.substring(0, 50),
              contextType: 'safety_comment'
            }
          });
        }
      }
    } else if (action === 'update' && safetyUpdateId) {
      // When a safety update is modified, update any related activities to keep them in sync
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
      message: `Safety update notification processed successfully`
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
