
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

  group_event_created: {
    id: 'group_event_created',
    template: '{{actor}} created a new group event: {{title}}',
    contentType: 'events',
    notificationType: 'event',
    actionType: 'view',
    actionLabel: 'View Event',
    relevanceScore: 3, // High - group member notification
    description: 'When someone creates a new event for your group'
  },

  // Skills Module  
  skill_session_request: {
    id: 'skill_session_request',
    template: '{{actor}} is interested in your {{title}} skill',
    contentType: 'skills',
    notificationType: 'skills',
    actionType: 'respond',
    actionLabel: 'View Interest',
    relevanceScore: 3, // High - direct request
    description: 'When someone is interested in a skill you offer'
  },


  // skill_session_cancelled template removed - skill sessions deprecated

  skill_offered: {
    id: 'skill_offered',
    template: '{{actor}} is offering {{title}}',
    contentType: 'skills',
    notificationType: 'skills',
    actionType: 'view',
    actionLabel: 'View Skill',
    relevanceScore: 1, // Low - general interest
    description: 'When someone offers a new skill in your neighborhood'
  },

  skill_requested: {
    id: 'skill_requested',
    template: '{{actor}} is looking to learn {{title}}',
    contentType: 'skills',
    notificationType: 'skills',
    actionType: 'respond',
    actionLabel: 'Help Out',
    relevanceScore: 2, // Medium - you might be able to help
    description: 'When someone requests to learn a skill you might offer'
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

  goods_offered: {
    id: 'goods_offered',
    template: '{{actor}} is sharing {{title}}',
    contentType: 'goods',
    notificationType: 'goods',
    actionType: 'view',
    actionLabel: 'View Item',
    relevanceScore: 1, // Low - general interest
    description: 'When someone offers goods in your neighborhood'
  },

  goods_requested: {
    id: 'goods_requested',
    template: '{{actor}} is looking for {{title}}',
    contentType: 'goods',
    notificationType: 'goods',
    actionType: 'respond',
    actionLabel: 'Help Out',
    relevanceScore: 2, // Medium - you might be able to help
    description: 'When someone requests goods you might have'
  },

  // Safety Module
  safety_comment: {
    id: 'safety_comment',
    template: '{{actor}} commented on your {{title}}',
    contentType: 'safety',
    notificationType: 'safety',
    actionType: 'view',
    actionLabel: 'View Comment',
    relevanceScore: 2, // Medium - follow-up on your content
    description: 'When someone comments on your safety report'
  },

  safety_update: {
    id: 'safety_update',
    template: '{{actor}} shared a safety update: {{title}}',
    contentType: 'safety',
    notificationType: 'safety',
    actionType: 'view',
    actionLabel: 'View Update',
    relevanceScore: 2, // Medium - neighborhood safety
    description: 'When someone posts a safety update in your neighborhood'
  },

  safety_emergency: {
    id: 'safety_emergency',
    template: '{{actor}} reported an emergency: {{title}}',
    contentType: 'safety',
    notificationType: 'safety',
    actionType: 'view',
    actionLabel: 'View Emergency',
    relevanceScore: 3, // High - urgent safety matter
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

  // Neighbors Module - simplified template
  neighbor_joined: {
    id: 'neighbor_joined',
    template: '{{actor}} joined',
    contentType: 'neighbors',
    notificationType: 'neighbor_welcome',
    actionType: 'view',
    actionLabel: 'View Profile',
    relevanceScore: 1, // Low - nice to know but not urgent
    description: 'When someone new joins the neighborhood'
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
