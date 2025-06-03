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
  action: 'request' | 'confirm' | 'cancel' | 'reschedule' | 'complete' | 'update';
  skillId: string;
  skillTitle: string;
  providerId: string;
  requesterId: string;
  sessionId?: string;
  sessionTime?: string;
  requestData?: any;
  eventId?: string;
}

/**
 * Edge Function to handle skills exchange notifications
 * This function creates notifications when skills are requested, confirmed,
 * canceled, rescheduled, or completed
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
      sessionId,
      sessionTime,
      requestData,
      eventId
    } = await req.json() as SkillRequest;

    logger.info(`Processing ${action} notification for skill: ${skillTitle}`);
    logger.info(`Provider: ${providerId}, Requester: ${requesterId}`);

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
    
    // Get provider profile information for richer notifications
    let providerProfile = null;
    if (providerId) {
      const { data: providerData } = await supabaseClient
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', providerId)
        .single();
      providerProfile = providerData;
    }

    // Different actions require different notifications
    switch (action) {
      case 'request':
        // Create a notification for the provider about the new request
        await createSkillRequestNotification(
          supabaseClient,
          providerId,
          requesterId,
          skillId,
          skillTitle,
          requesterProfile,
          sessionId,
          requestData
        );
        break;
      
      case 'confirm':
        // Create notifications for both provider and requester about confirmation
        await createSkillConfirmationNotifications(
          supabaseClient,
          providerId,
          requesterId,
          skillId,
          skillTitle,
          requesterProfile,
          providerProfile,
          sessionId,
          sessionTime,
          eventId
        );
        break;
        
      case 'cancel':
        // Create notification about cancellation
        await createSkillCancellationNotification(
          supabaseClient,
          providerId,
          requesterId,
          skillId,
          skillTitle,
          requesterProfile,
          sessionId,
          sessionTime
        );
        break;
        
      case 'reschedule':
        // Create notifications about rescheduling
        await createSkillRescheduleNotification(
          supabaseClient,
          providerId,
          requesterId,
          skillId,
          skillTitle,
          requesterProfile,
          providerProfile,
          sessionId,
          sessionTime
        );
        break;
        
      case 'complete':
        // Create notifications for session completion
        await createSkillCompletionNotification(
          supabaseClient,
          providerId,
          requesterId,
          skillId,
          skillTitle,
          requesterProfile,
          sessionId
        );
        break;
        
      case 'update':
        // Handle updates to skill listings
        await createSkillUpdateNotification(
          supabaseClient,
          providerId,
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
  providerId: string,
  requesterId: string,
  skillId: string,
  skillTitle: string,
  requesterProfile: any,
  sessionId?: string,
  requestData?: any
) {
  logger.info(`Creating skill request notification for provider: ${providerId}`);
  
  const { error } = await supabaseClient
    .from('notifications')
    .insert({
      user_id: providerId,
      actor_id: requesterId,
      title: `New request for your skill: ${skillTitle}`,
      content_type: 'skill_sessions',
      content_id: sessionId || skillId,
      notification_type: 'skills',
      action_type: 'request',
      action_label: 'View Request',
      relevance_score: 4, // High relevance: direct action needed
      metadata: { 
        skillId,
        sessionId,
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

/**
 * Creates notifications for both users when a skill session is confirmed
 */
async function createSkillConfirmationNotifications(
  supabaseClient: any,
  providerId: string,
  requesterId: string,
  skillId: string,
  skillTitle: string,
  requesterProfile: any,
  providerProfile: any,
  sessionId?: string,
  sessionTime?: string,
  eventId?: string
) {
  logger.info(`Creating skill confirmation notifications`);
  
  // Create notifications for both provider and requester
  const notifications = [
    {
      user_id: providerId,
      actor_id: requesterId,
      title: `Skill session confirmed: ${skillTitle}`,
      content_type: 'skill_sessions',
      content_id: sessionId || skillId,
      notification_type: 'skills',
      action_type: 'confirm',
      action_label: 'View Session',
      relevance_score: 3, // Important: confirmed session
      metadata: { 
        skillId,
        sessionId,
        eventId,
        skillTitle,
        sessionTime,
        neighborName: requesterProfile?.display_name || "A neighbor",
        avatarUrl: requesterProfile?.avatar_url,
        contextType: 'skill_session'
      }
    },
    {
      user_id: requesterId,
      actor_id: providerId,
      title: `Skill session confirmed: ${skillTitle}`,
      content_type: 'skill_sessions',
      content_id: sessionId || skillId,
      notification_type: 'skills',
      action_type: 'confirm',
      action_label: 'View Session',
      relevance_score: 3, // Important: confirmed session
      metadata: { 
        skillId,
        sessionId,
        eventId,
        skillTitle,
        sessionTime,
        neighborName: providerProfile?.display_name || "A neighbor",
        avatarUrl: providerProfile?.avatar_url,
        contextType: 'skill_session'
      }
    }
  ];

  const { error } = await supabaseClient
    .from('notifications')
    .insert(notifications);

  if (error) {
    logger.error('[notify-skills-changes] Error creating confirmation notifications:', error);
    throw error;
  }
  
  logger.info(`Successfully created confirmation notifications for: ${skillTitle}`);
}

/**
 * Creates notification when a skill session is cancelled
 */
async function createSkillCancellationNotification(
  supabaseClient: any,
  providerId: string,
  requesterId: string,
  skillId: string,
  skillTitle: string,
  requesterProfile: any,
  sessionId?: string,
  sessionTime?: string
) {
  logger.info(`Creating skill cancellation notification`);

  // Notify the other party about the cancellation (assuming requester cancelled)
  const { error } = await supabaseClient
    .from('notifications')
    .insert({
      user_id: providerId, // Notify the provider
      actor_id: requesterId,
      title: `Skill session cancelled: ${skillTitle}`,
      content_type: 'skill_sessions',
      content_id: sessionId || skillId,
      notification_type: 'skills',
      action_type: 'cancel',
      action_label: 'View Details',
      relevance_score: 3,
      metadata: { 
        skillId,
        sessionId,
        skillTitle,
        sessionTime,
        neighborName: requesterProfile?.display_name || "A neighbor",
        avatarUrl: requesterProfile?.avatar_url,
        contextType: 'skill_session'
      }
    });

  if (error) {
    logger.error('[notify-skills-changes] Error creating cancellation notification:', error);
    throw error;
  }
  
  logger.info(`Successfully created cancellation notification for: ${skillTitle}`);
}

/**
 * Creates notifications when a skill session is rescheduled
 */
async function createSkillRescheduleNotification(
  supabaseClient: any,
  providerId: string,
  requesterId: string,
  skillId: string,
  skillTitle: string,
  requesterProfile: any,
  providerProfile: any,
  sessionId?: string,
  sessionTime?: string
) {
  logger.info(`Creating skill reschedule notification`);

  // Assuming requester rescheduled, notify provider
  const { error } = await supabaseClient
    .from('notifications')
    .insert({
      user_id: providerId,
      actor_id: requesterId,
      title: `Skill session rescheduled: ${skillTitle}`,
      content_type: 'skill_sessions',
      content_id: sessionId || skillId,
      notification_type: 'skills',
      action_type: 'reschedule',
      action_label: 'View Details',
      relevance_score: 3,
      metadata: { 
        skillId,
        sessionId,
        skillTitle,
        sessionTime,
        neighborName: requesterProfile?.display_name || "A neighbor",
        avatarUrl: requesterProfile?.avatar_url,
        contextType: 'skill_session'
      }
    });

  if (error) {
    logger.error('[notify-skills-changes] Error creating reschedule notification:', error);
    throw error;
  }
  
  logger.info(`Successfully created reschedule notification for: ${skillTitle}`);
}

/**
 * Creates notifications when a skill session is completed
 */
async function createSkillCompletionNotification(
  supabaseClient: any,
  providerId: string,
  requesterId: string,
  skillId: string,
  skillTitle: string,
  requesterProfile: any,
  sessionId?: string
) {
  logger.info(`Creating skill completion notification`);

  // Notify both parties that the session was completed
  const { error } = await supabaseClient
    .from('notifications')
    .insert({
      user_id: providerId,
      actor_id: requesterId,
      title: `Skill session completed: ${skillTitle}`,
      content_type: 'skill_sessions',
      content_id: sessionId || skillId,
      notification_type: 'skills',
      action_type: 'complete',
      action_label: 'View Details',
      relevance_score: 2, // Lower priority as it's informational
      metadata: { 
        skillId,
        sessionId,
        skillTitle,
        neighborName: requesterProfile?.display_name || "A neighbor",
        avatarUrl: requesterProfile?.avatar_url,
        contextType: 'skill_session'
      }
    });

  if (error) {
    logger.error('[notify-skills-changes] Error creating completion notification:', error);
    throw error;
  }
  
  logger.info(`Successfully created completion notification for: ${skillTitle}`);
}

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
  
  // Find interested users (those who've interacted with this skill)
  const { data: sessions, error: sessionsError } = await supabaseClient
    .from('skill_sessions')
    .select('requester_id')
    .eq('skill_id', skillId)
    .neq('requester_id', providerId);
  
  if (sessionsError) {
    logger.error('[notify-skills-changes] Error fetching related sessions:', sessionsError);
    throw sessionsError;
  }
  
  // Get unique requester IDs
  const interestedUsers = [...new Set(sessions.map((session: any) => session.requester_id))];
  
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
