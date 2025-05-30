
/**
 * Notification Templates Configuration
 * 
 * This file defines all notification templates with natural language phrases
 * that are personally relevant to specific users
 */

export interface NotificationTemplate {
  id: string;
  template: string;
  contentType: string;
  notificationType: string;
  actionType: string;
  actionLabel: string;
  relevanceScore: number;
  description: string;
}

/**
 * All notification templates using natural, conversational language
 * Only includes notifications that are personally relevant to the recipient
 */
export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  // Events Module
  event_rsvp: {
    id: 'event_rsvp',
    template: '{{actor}} RSVP\'d to {{title}}',
    contentType: 'events',
    notificationType: 'event',
    actionType: 'rsvp',
    actionLabel: 'View Event',
    relevanceScore: 3, // High - direct involvement
    description: 'When someone RSVPs to your event'
  },

  // Skills Module  
  skill_session_request: {
    id: 'skill_session_request',
    template: '{{actor}} wants to learn {{title}} from you',
    contentType: 'skills',
    notificationType: 'skills',
    actionType: 'respond',
    actionLabel: 'Respond',
    relevanceScore: 3, // High - direct request
    description: 'When someone requests a session with you for a skill you offer'
  },

  skill_session_confirmed: {
    id: 'skill_session_confirmed',
    template: '{{actor}} confirmed your {{title}} session',
    contentType: 'skill_sessions',
    notificationType: 'skills',
    actionType: 'view',
    actionLabel: 'View Session',
    relevanceScore: 3, // High - session confirmed
    description: 'When your skill session request is confirmed'
  },

  skill_session_cancelled: {
    id: 'skill_session_cancelled',
    template: '{{actor}} cancelled the {{title}} session',
    contentType: 'skill_sessions',
    notificationType: 'skills',
    actionType: 'view',
    actionLabel: 'View Details',
    relevanceScore: 2, // Medium - need to know but not urgent
    description: 'When your skill session is cancelled'
  },

  // Goods Module
  goods_response: {
    id: 'goods_response',
    template: '{{actor}} can help with your {{title}} request',
    contentType: 'goods',
    notificationType: 'goods',
    actionType: 'respond',
    actionLabel: 'View Response',
    relevanceScore: 3, // High - direct help offered
    description: 'When someone responds to your goods request'
  },

  // Safety Module
  safety_comment: {
    id: 'safety_comment',
    template: '{{actor}} commented on your {{title}} report',
    contentType: 'safety',
    notificationType: 'safety',
    actionType: 'view',
    actionLabel: 'View Comment',
    relevanceScore: 2, // Medium - follow-up on your content
    description: 'When someone comments on your safety report'
  },

  // Neighbors Module
  neighbor_joined: {
    id: 'neighbor_joined',
    template: '{{actor}} joined your neighborhood',
    contentType: 'neighbors',
    notificationType: 'neighbor_welcome',
    actionType: 'view',
    actionLabel: 'View Profile',
    relevanceScore: 1, // Low - nice to know but not urgent
    description: 'When someone new joins the neighborhood'
  }
};

/**
 * Template variable substitution function
 * Replaces {{variable}} placeholders with actual values
 */
export function processNotificationTemplate(
  templateId: string,
  variables: Record<string, string>
): { title: string; template: NotificationTemplate } | null {
  const template = NOTIFICATION_TEMPLATES[templateId];
  
  if (!template) {
    console.warn(`Template not found: ${templateId}`);
    return null;
  }

  // Replace template variables with actual values
  let processedTitle = template.template;
  
  // Replace all {{variable}} patterns with actual values
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    processedTitle = processedTitle.replace(new RegExp(placeholder, 'g'), value || 'Unknown');
  });

  return {
    title: processedTitle,
    template
  };
}

/**
 * Get template by ID with validation
 */
export function getNotificationTemplate(templateId: string): NotificationTemplate | null {
  return NOTIFICATION_TEMPLATES[templateId] || null;
}

/**
 * Get all available template IDs
 */
export function getAvailableTemplateIds(): string[] {
  return Object.keys(NOTIFICATION_TEMPLATES);
}
