/**
 * Centralized Email Configuration
 * 
 * This file contains all the shared email configuration constants,
 * from addresses, domains, and campaign definitions used across all email templates.
 */

// =============================================================================
// EMAIL DOMAINS & ADDRESSES  
// =============================================================================

/**
 * Primary email configuration
 * These should be the only email addresses used throughout the system
 */
export const EMAIL_CONFIG = {
  // Verified sending domains
  VERIFIED_DOMAIN: 'updates.neighborhoodos.com',
  
  // From addresses for different email types
  FROM_ADDRESSES: {
    DEFAULT: 'neighborhoodOS <hello@updates.neighborhoodos.com>',
    NOTIFICATIONS: 'neighborhoodOS Notifications <notifications@updates.neighborhoodos.com>', 
    INVITATIONS: 'neighborhoodOS <invitations@updates.neighborhoodos.com>',
    WEEKLY_SUMMARY: 'Your Neighborhood Summary <summary@updates.neighborhoodos.com>',
    SYSTEM: 'neighborhoodOS System <system@updates.neighborhoodos.com>',
  },
  
  // Reply-to addresses
  REPLY_TO: {
    SUPPORT: 'support@neighborhoodos.com',
    NO_REPLY: 'no-reply@updates.neighborhoodos.com',
  },
  
  // Production base URL
  BASE_URL: 'https://neighborhoodos.com',
} as const;

// =============================================================================
// UTM CAMPAIGN DEFINITIONS
// =============================================================================

/**
 * Standardized UTM campaign names for consistent email tracking
 * These help us understand which emails are driving engagement
 */
export const UTM_CAMPAIGNS = {
  // Onboarding & Welcome
  WELCOME: 'welcome_email',
  ONBOARDING: 'onboarding_series',
  
  // Invitations & Growth
  INVITATION: 'invitation_email',
  INVITATION_ACCEPTED: 'invitation_accepted',
  
  // Activity Notifications  
  COMMENT_NOTIFICATION: 'comment_notification',
  RSVP_NOTIFICATION: 'rsvp_notification', 
  SKILL_REQUEST: 'skill_request',
  SKILL_RESPONSE: 'skill_response',
  
  // Safety & Community
  SAFETY_ALERT: 'safety_alert',
  NEIGHBOR_JOINED: 'neighbor_joined',
  
  // Engagement & Retention
  WEEKLY_SUMMARY: 'weekly_summary',
  RE_ENGAGEMENT: 're_engagement',
  
  // Administrative
  ADMIN_NOTIFICATION: 'admin_notification',
  SYSTEM_UPDATE: 'system_update',
} as const;

/**
 * Standard UTM source and medium values
 */
export const UTM_DEFAULTS = {
  SOURCE: 'email',
  MEDIUM: 'email',
} as const;

// =============================================================================
// EMAIL SUBJECT TEMPLATES
// =============================================================================

/**
 * Standardized email subject line templates
 * Using {{variable}} syntax for consistent replacement across the system
 */
export const EMAIL_SUBJECTS = {
  // Welcome & Onboarding
  WELCOME: 'Welcome to {{neighborhoodName}}, {{recipientName}}! 👋',
  ONBOARDING_COMMUNITY: 'Getting started in {{neighborhoodName}}',
  ONBOARDING_EVENTS: 'Events and gatherings in {{neighborhoodName}}',
  ONBOARDING_SKILLS: 'Sharing skills with your neighbors',
  ONBOARDING_GOODS: 'The neighborly exchange in {{neighborhoodName}}', 
  ONBOARDING_DIRECTORY: 'Your {{neighborhoodName}} neighbor directory',
  ONBOARDING_CARE: 'Community care in {{neighborhoodName}}',
  ONBOARDING_CONCLUSION: 'You\'re all set in {{neighborhoodName}}!',
  
  // Invitations
  INVITATION: '{{actorName}} invited you to join {{neighborhoodName}}',
  INVITATION_ACCEPTED_TO_INVITER: '{{subjectName}} accepted your invitation to {{neighborhoodName}}',
  INVITATION_ACCEPTED_TO_ADMIN: 'New member joined {{neighborhoodName}}: {{subjectName}}',
  
  // Activity Notifications (Actor → Recipient)
  COMMENT_ON_EVENT: '{{actorName}} commented on your {{contentTitle}}',
  COMMENT_ON_SKILL: '{{actorName}} commented on your skill: {{contentTitle}}',
  COMMENT_ON_SAFETY: '{{actorName}} commented on your safety update: {{contentTitle}}',
  RSVP_TO_EVENT: '{{actorName}} is attending your {{contentTitle}}',
  
  // Skill Exchange
  SKILL_REQUEST: '{{actorName}} wants help with: {{contentTitle}}',
  SKILL_RESPONSE: '{{actorName}} can help with: {{contentTitle}}',
  SKILL_SESSION_CONFIRMED: 'Skill session confirmed: {{contentTitle}}',
  SKILL_SESSION_CANCELLED: 'Skill session cancelled: {{contentTitle}}',
  
  // Safety & Community  
  SAFETY_EMERGENCY: '🚨 Emergency Alert in {{neighborhoodName}}: {{contentTitle}}',
  SAFETY_SUSPICIOUS: '⚠️ Suspicious Activity in {{neighborhoodName}}: {{contentTitle}}',
  SAFETY_GENERAL: 'Safety Update in {{neighborhoodName}}: {{contentTitle}}',
  NEIGHBOR_JOINED: '{{actorName}} joined {{neighborhoodName}}',
  
  // Weekly & System
  WEEKLY_SUMMARY: 'Your {{neighborhoodName}} weekly summary',
  ADMIN_WEEKLY_DIGEST: 'Admin digest for {{neighborhoodName}} - {{weekOf}}',
  SYSTEM_UPDATE: 'neighborhoodOS system update',
  
  // Goods Exchange
  GOODS_AVAILABLE: 'Free item available in {{neighborhoodName}}: {{contentTitle}}',
  GOODS_RESPONSE: '{{actorName}} is interested in your {{contentTitle}}',
} as const;

// =============================================================================  
// EMAIL TEMPLATE MAPPINGS
// =============================================================================

/**
 * Maps email template types to their configuration
 * This helps the parameter resolver know how to handle different email types
 */
export const EMAIL_TEMPLATE_CONFIG = {
  // Welcome emails
  'welcome': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.DEFAULT,
    subjectTemplate: EMAIL_SUBJECTS.WELCOME,
    utmCampaign: UTM_CAMPAIGNS.WELCOME,
    relationship: 'system-broadcast' as const,
  },
  
  // Invitation emails
  'invitation': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.INVITATIONS,
    subjectTemplate: EMAIL_SUBJECTS.INVITATION,
    utmCampaign: UTM_CAMPAIGNS.INVITATION,
    relationship: 'actor-recipient' as const,
  },
  
  'invitation-accepted-inviter': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.NOTIFICATIONS,
    subjectTemplate: EMAIL_SUBJECTS.INVITATION_ACCEPTED_TO_INVITER,
    utmCampaign: UTM_CAMPAIGNS.INVITATION_ACCEPTED,
    relationship: 'actor-recipient' as const,
  },
  
  'invitation-accepted-admin': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.NOTIFICATIONS,
    subjectTemplate: EMAIL_SUBJECTS.INVITATION_ACCEPTED_TO_ADMIN,
    utmCampaign: UTM_CAMPAIGNS.INVITATION_ACCEPTED,
    relationship: 'admin-member' as const,
  },
  
  // Activity notifications
  'comment-notification': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.NOTIFICATIONS,
    subjectTemplate: EMAIL_SUBJECTS.COMMENT_ON_EVENT, // Will be dynamic based on content type
    utmCampaign: UTM_CAMPAIGNS.COMMENT_NOTIFICATION,
    relationship: 'actor-recipient' as const,
  },
  
  'rsvp-notification': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.NOTIFICATIONS,
    subjectTemplate: EMAIL_SUBJECTS.RSVP_TO_EVENT,
    utmCampaign: UTM_CAMPAIGNS.RSVP_NOTIFICATION,
    relationship: 'actor-recipient' as const,
  },
  
  // Skills  
  'skill-request': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.NOTIFICATIONS,
    subjectTemplate: EMAIL_SUBJECTS.SKILL_REQUEST,
    utmCampaign: UTM_CAMPAIGNS.SKILL_REQUEST,
    relationship: 'requester-provider' as const,
  },
  
  // Safety
  'safety-alert': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.NOTIFICATIONS,
    subjectTemplate: EMAIL_SUBJECTS.SAFETY_EMERGENCY,
    utmCampaign: UTM_CAMPAIGNS.SAFETY_ALERT,
    relationship: 'system-broadcast' as const,
  },
  
  // Weekly summaries
  'weekly-summary': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.WEEKLY_SUMMARY,
    subjectTemplate: EMAIL_SUBJECTS.WEEKLY_SUMMARY,
    utmCampaign: UTM_CAMPAIGNS.WEEKLY_SUMMARY,
    relationship: 'system-broadcast' as const,
  },
  
  // Onboarding series
  'onboarding-community': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.DEFAULT,
    subjectTemplate: EMAIL_SUBJECTS.ONBOARDING_COMMUNITY,
    utmCampaign: UTM_CAMPAIGNS.ONBOARDING,
    relationship: 'system-broadcast' as const,
  },
  
  'onboarding-events': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.DEFAULT,
    subjectTemplate: EMAIL_SUBJECTS.ONBOARDING_EVENTS,
    utmCampaign: UTM_CAMPAIGNS.ONBOARDING,
    relationship: 'system-broadcast' as const,
  },
  
  'onboarding-skills': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.DEFAULT,
    subjectTemplate: EMAIL_SUBJECTS.ONBOARDING_SKILLS,
    utmCampaign: UTM_CAMPAIGNS.ONBOARDING,
    relationship: 'system-broadcast' as const,
  },
  
  'onboarding-goods': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.DEFAULT,
    subjectTemplate: EMAIL_SUBJECTS.ONBOARDING_GOODS,
    utmCampaign: UTM_CAMPAIGNS.ONBOARDING,
    relationship: 'system-broadcast' as const,
  },
  
  'onboarding-directory': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.DEFAULT,
    subjectTemplate: EMAIL_SUBJECTS.ONBOARDING_DIRECTORY,
    utmCampaign: UTM_CAMPAIGNS.ONBOARDING,
    relationship: 'system-broadcast' as const,
  },
  
  'onboarding-care': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.DEFAULT,
    subjectTemplate: EMAIL_SUBJECTS.ONBOARDING_CARE,
    utmCampaign: UTM_CAMPAIGNS.ONBOARDING,
    relationship: 'system-broadcast' as const,
  },
  
  'onboarding-conclusion': {
    fromAddress: EMAIL_CONFIG.FROM_ADDRESSES.DEFAULT,
    subjectTemplate: EMAIL_SUBJECTS.ONBOARDING_CONCLUSION,
    utmCampaign: UTM_CAMPAIGNS.ONBOARDING,
    relationship: 'system-broadcast' as const,
  },
  
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get email configuration for a specific template type
 */
export function getEmailTemplateConfig(templateType: keyof typeof EMAIL_TEMPLATE_CONFIG) {
  return EMAIL_TEMPLATE_CONFIG[templateType];
}

/**
 * Get the appropriate from address for an email type
 */
export function getFromAddress(templateType: keyof typeof EMAIL_TEMPLATE_CONFIG): string {
  const config = EMAIL_TEMPLATE_CONFIG[templateType];
  return config?.fromAddress || EMAIL_CONFIG.FROM_ADDRESSES.DEFAULT;
}

/**
 * Get UTM campaign for a template type
 */
export function getUtmCampaign(templateType: keyof typeof EMAIL_TEMPLATE_CONFIG): string {
  const config = EMAIL_TEMPLATE_CONFIG[templateType];
  return config?.utmCampaign || UTM_CAMPAIGNS.SYSTEM_UPDATE;
}