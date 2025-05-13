
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SkillRequest {
  action: 'request' | 'confirm' | 'delete' | 'update';
  skillId: string;
  skillTitle: string;
  providerId: string;
  requesterId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with enhanced logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_ANON_KEY');
      throw new Error('Server configuration error');
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Extract data from the request with explicit type casting for safety
    const requestBody = await req.json();
    const { action, skillId, skillTitle, providerId, requesterId } = requestBody as SkillRequest;

    console.log(`Processing ${action} notification for skill: ${skillTitle}`);
    console.log(`Provider ID: ${providerId}, Requester ID: ${requesterId}`);

    // Different actions require different notifications
    if (action === 'request') {
      // Create a notification for the provider
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: providerId,
          actor_id: requesterId,
          title: `New request for your skill: ${skillTitle}`,
          content_type: 'skills_exchange',
          content_id: skillId,
          notification_type: 'skills',
          action_type: 'view',
          action_label: 'View Request',
          relevance_score: 3, // High relevance: direct involvement
          metadata: { 
            skillId,
            requesterId,
            type: 'skill_request'
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        throw notificationError;
      } else {
        console.log(`Successfully created notification for skill request: ${skillTitle}`);
      }
    }
    else if (action === 'confirm') {
      // Create a notification for both provider and requester
      const notifications = [
        {
          user_id: providerId,
          actor_id: requesterId,
          title: `Skill session confirmed: ${skillTitle}`,
          content_type: 'skills_exchange',
          content_id: skillId,
          notification_type: 'skills',
          action_type: 'view',
          action_label: 'View Session',
          relevance_score: 3,
          metadata: { 
            skillId,
            type: 'skill_session_confirmed'
          }
        },
        {
          user_id: requesterId,
          actor_id: providerId,
          title: `Skill session confirmed: ${skillTitle}`,
          content_type: 'skills_exchange',
          content_id: skillId,
          notification_type: 'skills',
          action_type: 'view',
          action_label: 'View Session',
          relevance_score: 3,
          metadata: { 
            skillId,
            type: 'skill_session_confirmed'
          }
        }
      ];

      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating confirmation notifications:', notificationError);
        throw notificationError;
      } else {
        console.log(`Successfully created confirmation notifications for skill: ${skillTitle}`);
      }
    }
    else if (action === 'delete') {
      console.log(`Processing delete notification for ${skillTitle}`);
      // Handle skill deletion notifications if needed
    }
    else if (action === 'update') {
      console.log(`Processing update notification for ${skillTitle}`);
      // Handle skill update notifications if needed
    }
    else {
      console.warn(`Unknown action type: ${action}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Skill notification processed successfully` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in notify-skills-changes:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

// Attach the handler to Deno's serve function
serve(handler);
