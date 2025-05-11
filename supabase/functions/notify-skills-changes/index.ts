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
  action: 'update' | 'delete' | 'request' | 'create'; // Added 'create' action
  skillTitle: string;
  changes?: string;
  providerId?: string;
  requesterId?: string;
  neighborhoodId?: string; // Added neighborhoodId for activity creation
  description?: string;    // Added description for activity creation
  category?: string;       // Added category for the skill
  requestType?: string;    // Added request type (offer/need)
}

// Main handler function for the edge function
const handler = async (req: Request): Promise<Response> => {
  console.log(`[TRACE] notify-skills-changes function called with method: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`[TRACE] Handling OPTIONS request for CORS preflight`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with admin privileges using environment variables
    console.log(`[TRACE] Creating Supabase client using environment variables`);
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Extract data from the request body
    console.log(`[TRACE] Parsing request body`);
    const requestBody = await req.json();
    console.log(`[TRACE] Request body received:`, JSON.stringify(requestBody));
    
    const { 
      skillId, 
      action, 
      skillTitle, 
      changes, 
      providerId, 
      requesterId,
      neighborhoodId,
      description,
      category,
      requestType
    } = requestBody as UpdateRequest;

    console.log(`[notify-skills-changes] Processing ${action} notification for skill: ${skillTitle} (ID: ${skillId})`);
    console.log(`[TRACE] Full request details:`, {
      skillId, 
      action,
      skillTitle,
      changes,
      providerId,
      requesterId,
      neighborhoodId,
      description,
      category,
      requestType
    });
    
    // Handle new skill creation - create an activity record
    if (action === 'create' && skillId && neighborhoodId) {
      console.log(`[notify-skills-changes] Creating activity for new skill: ${skillTitle}, id: ${skillId}`);
      console.log(`[TRACE] Creating activity with neighborhoodId: ${neighborhoodId}`);
      
      // Determine the activity type based on request type
      const activityType = requestType === 'offer' ? 'skill_offered' : 'skill_requested';
      console.log(`[TRACE] Activity type determined: ${activityType} based on requestType: ${requestType}`);
      
      // Create the insert data object
      const activityData = {
        content_id: skillId,
        content_type: 'skills_exchange',
        title: skillTitle,
        actor_id: requestType === 'offer' ? providerId : requesterId,
        activity_type: activityType,
        neighborhood_id: neighborhoodId,
        is_public: true,
        metadata: {
          description: description || null,
          category: category || null,
          requestType: requestType || null
        }
      };
      
      console.log(`[TRACE] Activity data to insert:`, JSON.stringify(activityData, null, 2));
      
      // Create a new activity record
      const { data: activityData, error: activityError } = await supabaseClient
        .from('activities')
        .insert(activityData)
        .select();
        
      if (activityError) {
        console.error('[notify-skills-changes] Error creating activity record:', activityError);
        console.error(`[TRACE] Activity insertion error details:`, {
          code: activityError.code,
          message: activityError.message,
          details: activityError.details
        });
        throw activityError;
      } else {
        console.log('[notify-skills-changes] Successfully created activity record:', activityData);
        console.log(`[TRACE] New activity ID: ${activityData?.[0]?.id}`);
      }
    }

    // When a skill is modified, update any related activities to keep them in sync
    // Now using the skill_id field for more reliable joins
    if (action === 'update' && skillId) {
      console.log(`[TRACE] Processing update action for skill ${skillId}`);
      
      // Update any activities related to this skill
      const { error: activityError, data: updatedData } = await supabaseClient
        .from('activities')
        .update({ title: skillTitle })
        .eq('content_type', 'skills_exchange')
        .eq('content_id', skillId)
        .select();

      if (activityError) {
        console.error('[notify-skills-changes] Error updating activities:', activityError);
        console.error(`[TRACE] Activity update error details:`, {
          code: activityError.code,
          message: activityError.message,
          details: activityError.details
        });
        throw activityError;
      } else {
        console.log(`[notify-skills-changes] Successfully updated related activities for skill: ${skillTitle}`);
        console.log(`[TRACE] Updated ${updatedData?.length || 0} activity records`);
      }
    }

    // Handle skill request notifications
    if (action === 'request' && skillId && providerId && requesterId) {
      console.log(`[notify-skills-changes] Creating notification for skill request: providerId=${providerId}, requesterId=${requesterId}`);
      console.log(`[TRACE] Processing request action for skill ${skillId}`);
      
      // First, get requester's profile information to include in notification
      const { data: requesterProfile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', requesterId)
        .single();
        
      if (profileError) {
        console.error('[notify-skills-changes] Error fetching requester profile:', profileError);
        console.error(`[TRACE] Profile fetch error details:`, {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details
        });
      } else {
        console.log('[notify-skills-changes] Fetched requester profile:', requesterProfile);
        console.log(`[TRACE] Requester profile details:`, {
          display_name: requesterProfile?.display_name,
          has_avatar: !!requesterProfile?.avatar_url
        });
      }
      
      // Create notification data
      const notificationData = {
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
          requesterId,
          skillTitle,
          requesterName: requesterProfile?.display_name || null,
          requesterAvatar: requesterProfile?.avatar_url || null
        }
      };
      
      console.log(`[TRACE] Notification data to insert:`, JSON.stringify(notificationData, null, 2));
      
      // Create a notification for the provider
      const { data: createdNotification, error: notificationError } = await supabaseClient
        .from('notifications')
        .insert(notificationData)
        .select();
        
      if (notificationError) {
        console.error('[notify-skills-changes] Error creating notification:', notificationError);
        console.error(`[TRACE] Notification creation error details:`, {
          code: notificationError.code,
          message: notificationError.message,
          details: notificationError.details
        });
        throw notificationError;
      } else {
        console.log('[notify-skills-changes] Successfully created notification for provider:', createdNotification);
        console.log(`[TRACE] New notification ID: ${createdNotification?.[0]?.id}`);
      }
    }

    // Return a success response
    console.log(`[TRACE] Function completed successfully, returning response`);
    return new Response(JSON.stringify({ 
      success: true,
      message: `Skill activities processed successfully`,
      action: action,
      skillId: skillId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Log and return any errors
    console.error('[notify-skills-changes] Error:', error);
    console.error(`[TRACE] Error stack:`, error.stack);
    return new Response(JSON.stringify({ 
      error: error.message,
      errorDetails: error.details || null,
      errorCode: error.code || null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

// Attach the handler to Deno's serve function
serve(handler);
