
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
  action: 'update';
  skillId: string;
  skillTitle: string;
  providerId: string;
}

/**
 * Edge Function to handle skills exchange notifications
 * Simplified to only handle skill updates, no complex session scheduling
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
      providerId
    } = await req.json() as SkillRequest;

    logger.info(`Processing ${action} notification for skill: ${skillTitle}`);
    logger.info(`Provider: ${providerId}`);

    // Only handle update actions now
    if (action === 'update') {
      await createSkillUpdateNotification(
        supabaseClient,
        providerId,
        skillId,
        skillTitle
      );
    } else {
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
 * Creates notification about updates to a skill listing
 */
async function createSkillUpdateNotification(
  supabaseClient: any,
  providerId: string,
  skillId: string,
  skillTitle: string
) {
  logger.info(`Processing skill update notification`);
  
  // Find interested users who might have requested similar skills
  const { data: interestedSkills, error: interestedError } = await supabaseClient
    .from('skills_exchange')
    .select('user_id')
    .eq('request_type', 'need')
    .neq('user_id', providerId);
  
  if (interestedError) {
    logger.error('[notify-skills-changes] Error fetching interested users:', interestedError);
    throw interestedError;
  }
  
  // Get unique interested user IDs
  const interestedUsers = [...new Set(interestedSkills.map((skill: any) => skill.user_id))];
  
  // Create notifications for interested users
  if (interestedUsers.length > 0) {
    const notifications = interestedUsers.map((userId: string) => ({
      user_id: userId,
      actor_id: providerId,
      title: `Skill updated: ${skillTitle}`,
      content_type: 'skills_exchange',
      content_id: skillId,
      notification_type: 'skills',
      action_type: 'update',
      action_label: 'View Skill',
      relevance_score: 2, // Medium priority as it's an update
      metadata: { 
        skillId,
        skillTitle,
        contextType: 'skill_update'
      }
    }));
    
    const { error } = await supabaseClient
      .from('notifications')
      .insert(notifications);

    if (error) {
      logger.error('[notify-skills-changes] Error creating update notifications:', error);
      throw error;
    }
    
    logger.info(`Created update notifications for ${notifications.length} user(s)`);
  } else {
    logger.info('[notify-skills-changes] No interested users found for update notification');
  }
}

// Attach the handler to Deno's serve function
serve(handler);
