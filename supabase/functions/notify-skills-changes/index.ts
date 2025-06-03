// Edge Function for Skills Notifications
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCorsPreflightRequest, 
  successResponse, 
  errorResponse, 
  createLogger 
} from "../_shared/cors.ts";

// Create a logger for this function
const logger = createLogger('notify-skills-changes');

interface SkillRequest {
  action: 'request' | 'update';
  skillId: string;
  skillTitle: string;
  providerId?: string;
  requesterId: string;
  requestData?: any;
}

/**
 * Edge Function to handle skills exchange notifications
 * This function creates notifications when skills are requested or updated
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    // Initialize Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Extract data from the request
    const { 
      action, 
      skillId, 
      skillTitle, 
      providerId, 
      requesterId,
      requestData
    } = await req.json() as SkillRequest;

    logger.info(`Processing ${action} notification for skill: ${skillTitle}`);
    logger.info(`Requester: ${requesterId}${providerId ? `, Provider: ${providerId}` : ''}`);

    // Get requester profile information for richer notifications
    let requesterProfile = null;
    if (requesterId) {
      const { data: requesterData } = await supabaseClient
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', requesterId)
        .single();
      requesterProfile = requesterData;
    }

    // Different actions require different notifications
    switch (action) {
      case 'request':
        // Create notifications for skill providers about the new request
        await createSkillRequestNotification(
          supabaseClient,
          providerId,
          requesterId,
          skillId,
          skillTitle,
          requesterProfile,
          requestData
        );
        break;
        
      case 'update':
        // Handle updates to skill listings
        await createSkillUpdateNotification(
          supabaseClient,
          requesterId, // The person who updated the skill
          skillId,
          skillTitle
        );
        break;
      
      default:
        logger.warn(`Unsupported action: ${action}`);
        throw new Error(`Unsupported action: ${action}`);
    }

    return successResponse(
      { action, skillId },
      `Skill notification processed successfully for action: ${action}`
    );
  } catch (error) {
    logger.error('Error:', error);
    return errorResponse(error);
  }
};

/**
 * Creates a notification for a skill request
 */
async function createSkillRequestNotification(
  supabaseClient: any,
  providerId: string | undefined,
  requesterId: string,
  skillId: string,
  skillTitle: string,
  requesterProfile: any,
  requestData?: any
) {
  logger.info(`Creating skill request notification`);
  
  // If no specific provider, notify all neighbors who have offered similar skills
  if (!providerId) {
    // Get the skill category to find matching providers
    const { data: skillData } = await supabaseClient
      .from('skills_exchange')
      .select('skill_category, neighborhood_id')
      .eq('id', skillId)
      .single();
      
    if (!skillData) {
      logger.error('Skill not found for notification');
      return;
    }
    
    // Find all providers in the same neighborhood who offer similar skills
    const { data: providers } = await supabaseClient
      .from('skills_exchange')
      .select('user_id')
      .eq('neighborhood_id', skillData.neighborhood_id)
      .eq('skill_category', skillData.skill_category)
      .eq('request_type', 'offer')
      .eq('is_archived', false)
      .neq('user_id', requesterId); // Don't notify the requester
      
    if (!providers || providers.length === 0) {
      logger.info('No matching providers found for notification');
      return;
    }
    
    // Create notifications for all matching providers
    const notifications = providers.map((provider: any) => ({
      user_id: provider.user_id,
      actor_id: requesterId,
      title: `New skill request: ${skillTitle}`,
      content_type: 'skills_exchange',
      content_id: skillId,
      notification_type: 'skills',
      action_type: 'contact',
      action_label: 'Share Contact',
      relevance_score: 3, // High relevance: direct skill match
      metadata: { 
        skillId,
        requesterId,
        skillTitle,
        neighborName: requesterProfile?.display_name || "A neighbor",
        avatarUrl: requesterProfile?.avatar_url,
        contextType: 'skill_request',
        actionRequired: true,
        skillRequestData: requestData
      }
    }));
    
    const { error } = await supabaseClient
      .from('notifications')
      .insert(notifications);

    if (error) {
      logger.error('Error creating skill request notifications:', error);
      throw error;
    }
    
    logger.info(`Successfully created skill request notifications for ${notifications.length} providers`);
  } else {
    // Notify specific provider
    const { error } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: providerId,
        actor_id: requesterId,
        title: `New request for your skill: ${skillTitle}`,
        content_type: 'skills_exchange',
        content_id: skillId,
        notification_type: 'skills',
        action_type: 'contact',
        action_label: 'Share Contact',
        relevance_score: 4, // High relevance: direct action needed
        metadata: { 
          skillId,
          requesterId,
          skillTitle,
          neighborName: requesterProfile?.display_name || "A neighbor",
          avatarUrl: requesterProfile?.avatar_url,
          contextType: 'skill_request',
          actionRequired: true,
          skillRequestData: requestData
        }
      });

    if (error) {
      logger.error('Error creating skill request notification:', error);
      throw error;
    }
    
    logger.info(`Successfully created skill request notification for: ${skillTitle}`);
  }
}

/**
 * Creates notification about updates to a skill listing
 */
async function createSkillUpdateNotification(
  supabaseClient: any,
  updaterId: string,
  skillId: string,
  skillTitle: string
) {
  logger.info(`Processing skill update notification`);
  
  // For skill updates, we can create a general activity notification
  // but don't need to spam all neighbors - keep it simple
  logger.info(`Skill updated: ${skillTitle} by user: ${updaterId}`);
  
  // Could potentially notify interested users here, but for now
  // we'll keep it simple and just log the update
}

// Attach the handler to Deno's serve function
serve(handler);
