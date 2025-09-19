/**
 * Notification Templates Configuration
 * 
 * This file defines all notification templates with natural language phrases
 * that are personally relevant to specific users
 * 
 * ENHANCED: Fixed templates to properly use actor names instead of "Someone"
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
 * FIXED: Updated templates to use {{actor}} for proper name display
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

  event_created: {
    id: 'event_created',
    template: '{{actor}} created a new event: {{title}}',
    contentType: 'events',
    notificationType: 'event',
    actionType: 'view',
    actionLabel: 'View Event',
    relevanceScore: 2, // Medium - neighborhood activity
    description: 'When someone creates a new event in your neighborhood'
  },

  // Skills Module
  skill_requested: {
    id: 'skill_requested',
    template: '{{actor}} is looking for help with {{title}}',
    contentType: 'skills',
    notificationType: 'skills',
    actionType: 'help',
    actionLabel: 'Offer Help',
    relevanceScore: 2, // Medium - you might be able to help
    description: 'When someone requests a skill you might have'
  },

  skill_offered: {
    id: 'skill_offered',
    template: '{{actor}} is offering to help with {{title}}',
    contentType: 'skills',
    notificationType: 'skills',
    actionType: 'learn',
    actionLabel: 'Learn More',
    relevanceScore: 2, // Medium - you might want to learn
    description: 'When someone offers a skill you might want to learn'
  },

  skill_session_request: {
    id: 'skill_session_request',
    template: '{{actor}} wants to schedule a session for {{title}}',
    contentType: 'skills',
    notificationType: 'skills',
    actionType: 'schedule',
    actionLabel: 'Schedule Session',
    relevanceScore: 3, // High - direct request to you
    description: 'When someone requests a skill session with you'
  },

  skill_session_cancelled: {
    id: 'skill_session_cancelled',
    template: '{{actor}} cancelled the {{title}} session',
    contentType: 'skill_sessions',
    notificationType: 'skills',
    actionType: 'view',
    actionLabel: 'View Details',
    relevanceScore: 3, // High - affects your schedule
    description: 'When someone cancels a skill session with you'
  },

  // Goods Module
  goods_requested: {
    id: 'goods_requested',
    template: '{{actor}} is looking for {{title}}',
    contentType: 'goods',
    notificationType: 'goods',
    actionType: 'respond',
    actionLabel: 'Help Out',
    relevanceScore: 2, // Medium - you might have it
    description: 'When someone requests an item you might have'
  },

  goods_offered: {
    id: 'goods_offered',
    template: '{{actor}} is offering {{title}}',
    contentType: 'goods',
    notificationType: 'goods',
    actionType: 'view',
    actionLabel: 'View Item',
    relevanceScore: 1, // Low - general community offer
    description: 'When someone offers an item in your neighborhood'
  },

  goods_response: {
    id: 'goods_response',
    template: '{{actor}} can help with your {{title}} request',
    contentType: 'goods',
    notificationType: 'goods',
    actionType: 'respond',
    actionLabel: 'View Response',
    relevanceScore: 3, // High - direct response to your request
    description: 'When someone responds to your goods request'
  },

  // Safety Module
  safety_update: {
    id: 'safety_update',
    template: '{{actor}} shared a safety update: {{title}}',
    contentType: 'safety',
    notificationType: 'safety',
    actionType: 'view',
    actionLabel: 'View Update',
    relevanceScore: 2, // Medium - general safety awareness
    description: 'When someone shares a general safety update'
  },

  safety_comment: {
    id: 'safety_comment',
    template: '{{actor}} commented on your {{title}} report',
    contentType: 'safety',
    notificationType: 'safety',
    actionType: 'comment',
    actionLabel: 'View Comment',
    relevanceScore: 3, // High - comment on your content
    description: 'When someone comments on your safety report'
  },

  safety_emergency: {
    id: 'safety_emergency',
    template: '{{actor}} reported an emergency: {{title}}',
    contentType: 'safety',
    notificationType: 'safety',
    actionType: 'view',
    actionLabel: 'View Report',
    relevanceScore: 3, // High - immediate safety concern
    description: 'When someone reports an emergency in your neighborhood'
  },

  safety_suspicious: {
    id: 'safety_suspicious',
    template: '{{actor}} reported suspicious activity: {{title}}',
    contentType: 'safety',
    notificationType: 'safety',
    actionType: 'view',
    actionLabel: 'View Report',
    relevanceScore: 3, // High - important safety alert
    description: 'When someone reports suspicious activity in your neighborhood'
  },

  // Neighbors Module
  neighbor_joined: {
    id: 'neighbor_joined',
    template: '{{actor}} joined your neighborhood',
    contentType: 'neighbors',
    notificationType: 'neighbor_welcome',
    actionType: 'view',
    actionLabel: 'View Profile',
    relevanceScore: 1, // Low - ambient awareness
    description: 'When a new neighbor joins your neighborhood'
  },

  // Care/Support Module
  care_offered: {
    id: 'care_offered',
    template: '{{actor}} is offering {{title}}',
    contentType: 'care',
    notificationType: 'care',
    actionType: 'view',
    actionLabel: 'View Offer',
    relevanceScore: 1, // Low - general community support
    description: 'When someone offers care or support in your neighborhood'
  },

  care_requested: {
    id: 'care_requested',
    template: '{{actor}} is looking for {{title}}',
    contentType: 'care',
    notificationType: 'care',
    actionType: 'respond',
    actionLabel: 'Help Out',
    relevanceScore: 2, // Medium - you might be able to help
    description: 'When someone requests care or support you might provide'
  },

  care_response: {
    id: 'care_response',
    template: '{{actor}} can help with your {{title}} request',
    contentType: 'care',
    notificationType: 'care',
    actionType: 'respond',
    actionLabel: 'View Response',
    relevanceScore: 3, // High - direct help offered
    description: 'When someone responds to your care request'
  },

  // Groups Module - High-priority notifications only
  group_member_joined: {
    id: 'group_member_joined',
    template: '{{actor}} joined {{groupName}}',
    contentType: 'groups',
    notificationType: 'groups',
    actionType: 'view',
    actionLabel: 'View Group',
    relevanceScore: 2, // Medium - group management
    description: 'When someone joins a group you manage'
  },

  group_update_posted: {
    id: 'group_update_posted',
    template: '{{actor}} posted an update in {{groupName}}',
    contentType: 'group_updates',
    notificationType: 'groups',
    actionType: 'view',
    actionLabel: 'View Update',
    relevanceScore: 3, // High - direct group content
    description: 'When someone posts an update in your group'
  },

  group_update_comment: {
    id: 'group_update_comment',
    template: '{{actor}} commented on your update in {{groupName}}',
    contentType: 'group_update_comments',
    notificationType: 'groups',
    actionType: 'view',
    actionLabel: 'View Comment',
    relevanceScore: 3, // High - direct interaction
    description: 'When someone comments on your group update'
  },

  group_event_created: {
    id: 'group_event_created',
    template: '{{actor}} created an event for {{groupName}}: {{eventTitle}}',
    contentType: 'events',
    notificationType: 'groups',
    actionType: 'view',
    actionLabel: 'View Event',
    relevanceScore: 3, // High - group events are important
    description: 'When someone creates an event for your group'
  },

  group_invitation: {
    id: 'group_invitation',
    template: '{{actor}} invited you to join {{groupName}}',
    contentType: 'groups',
    notificationType: 'groups',
    actionType: 'view',
    actionLabel: 'View Group',
    relevanceScore: 3, // High - direct invitation to you
    description: 'When someone invites you to join their group'
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