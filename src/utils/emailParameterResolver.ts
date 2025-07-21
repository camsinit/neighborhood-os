/**
 * Unified Email Parameter Resolver
 * 
 * This is the core of our unified email system. It takes raw database data
 * and user context, then produces consistent, well-formatted email parameters
 * that all our email templates can use.
 * 
 * Key Features:
 * - Consistent name resolution (display_name → firstName → email fallback)
 * - Relationship-aware messaging ("Your neighbor Sarah" vs "Sarah") 
 * - Centralized URL generation with UTM tracking
 * - Type-safe parameter validation
 * - Graceful fallbacks for missing data
 */

import { 
  EmailContext, 
  EmailUserProfile, 
  NeighborhoodEmailContext,
  ContentReference,
  EmailRelationshipType,
  BaseEmailProps,
  ActorRecipientEmailProps,
  AdminNotificationEmailProps,
  SystemBroadcastEmailProps,
  EmailUrlType,
  EmailUrlConfig
} from '../types/emailTypes';

import { 
  EMAIL_CONFIG, 
  UTM_DEFAULTS, 
  EMAIL_SUBJECTS,
  getEmailTemplateConfig,
  getFromAddress,
  getUtmCampaign
} from './emailConfig';

// =============================================================================
// CORE RESOLVER FUNCTIONS
// =============================================================================

/**
 * Main entry point for resolving email parameters
 * Takes raw context and produces template-ready parameters
 */
export async function resolveEmailParameters(
  templateType: string,
  context: EmailContext
): Promise<BaseEmailProps> {
  // Get template configuration
  const templateConfig = getEmailTemplateConfig(templateType as any);
  
  // Resolve the recipient's display name with proper fallbacks
  const recipientName = resolveUserDisplayName(context.recipient, context.relationship);
  
  // Generate base email parameters that all templates need
  const baseParams: BaseEmailProps = {
    // Core personalization
    recipientName,
    neighborhoodName: context.neighborhood.name,
    
    // Consistent branding
    baseUrl: EMAIL_CONFIG.BASE_URL,
    fromName: extractNameFromAddress(templateConfig?.fromAddress || EMAIL_CONFIG.FROM_ADDRESSES.DEFAULT),
    fromEmail: extractEmailFromAddress(templateConfig?.fromAddress || EMAIL_CONFIG.FROM_ADDRESSES.DEFAULT),
    
    // UTM tracking
    utmCampaign: templateConfig?.utmCampaign || getUtmCampaign(templateType as any),
    utmSource: UTM_DEFAULTS.SOURCE,
    utmMedium: UTM_DEFAULTS.MEDIUM,
    
    // Standard links (with UTM parameters)
    homeUrl: generateEmailUrl('dashboard', {
      baseUrl: EMAIL_CONFIG.BASE_URL,
      utmSource: UTM_DEFAULTS.SOURCE,
      utmMedium: UTM_DEFAULTS.MEDIUM,
      utmCampaign: templateConfig?.utmCampaign || 'email',
      recipientId: context.recipient.id,
    }),
    unsubscribeUrl: generateEmailUrl('unsubscribe', {
      baseUrl: EMAIL_CONFIG.BASE_URL,
      utmSource: UTM_DEFAULTS.SOURCE,
      utmMedium: UTM_DEFAULTS.MEDIUM,
      utmCampaign: templateConfig?.utmCampaign || 'email',
      recipientId: context.recipient.id,
    }),
    settingsUrl: generateEmailUrl('settings', {
      baseUrl: EMAIL_CONFIG.BASE_URL,
      utmSource: UTM_DEFAULTS.SOURCE,
      utmMedium: UTM_DEFAULTS.MEDIUM,
      utmCampaign: templateConfig?.utmCampaign || 'email',
      recipientId: context.recipient.id,
    }),
  };
  
  return baseParams;
}

/**
 * Resolve parameters specifically for actor → recipient relationship emails
 * These are emails where someone did something that affects someone else
 */
export async function resolveActorRecipientParameters(
  templateType: string,
  context: EmailContext
): Promise<ActorRecipientEmailProps> {
  if (!context.actor) {
    throw new Error('Actor-recipient emails require an actor in the context');
  }
  
  const baseParams = await resolveEmailParameters(templateType, context);
  const templateConfig = getEmailTemplateConfig(templateType as any);
  
  // Resolve actor name with relationship context
  const actorName = resolveUserDisplayName(context.actor, context.relationship, 'actor');
  
  // Generate action description based on content type and template
  const actionDescription = generateActionDescription(context);
  
  // Generate content-specific URL
  const contentUrl = generateContentUrl(context.content, {
    baseUrl: EMAIL_CONFIG.BASE_URL,
    utmSource: UTM_DEFAULTS.SOURCE,
    utmMedium: UTM_DEFAULTS.MEDIUM,
    utmCampaign: templateConfig?.utmCampaign || 'email',
    recipientId: context.recipient.id,
  });
  
  return {
    ...baseParams,
    actorName,
    actorAvatarUrl: context.actor.avatarUrl,
    actionDescription,
    contentTitle: context.content.title,
    contentUrl,
    primaryCtaText: generateCtaText(context),
    primaryCtaUrl: contentUrl,
  };
}

/**
 * Resolve parameters for administrative notifications
 * These go to neighborhood admins about community activity
 */
export async function resolveAdminNotificationParameters(
  templateType: string,
  context: EmailContext
): Promise<AdminNotificationEmailProps> {
  const baseParams = await resolveEmailParameters(templateType, context);
  const templateConfig = getEmailTemplateConfig(templateType as any);
  
  // Generate activity description for admin context
  const activityDescription = generateAdminActivityDescription(context);
  
  // Resolve subject name (the person being talked about, not the recipient)
  const subjectName = context.subject ? resolveUserDisplayName(context.subject, context.relationship, 'subject') : undefined;
  
  // Generate admin-specific URLs
  const adminCtaUrl = generateAdminUrl(context, {
    baseUrl: EMAIL_CONFIG.BASE_URL,
    utmSource: UTM_DEFAULTS.SOURCE,
    utmMedium: UTM_DEFAULTS.MEDIUM,
    utmCampaign: templateConfig?.utmCampaign || 'admin_notification',
    recipientId: context.recipient.id,
  });
  
  return {
    ...baseParams,
    activityDescription,
    subjectName,
    adminCtaText: generateAdminCtaText(context),
    adminCtaUrl,
    communityStats: {
      totalMembers: context.neighborhood.memberCount,
      weeklyActivity: 0, // Would come from additional data in real implementation
    },
  };
}

// =============================================================================
// NAME RESOLUTION FUNCTIONS
// =============================================================================

/**
 * Resolve a user's display name with proper fallbacks and relationship context
 * This is the single source of truth for how names appear in emails
 */
export function resolveUserDisplayName(
  user: EmailUserProfile, 
  relationship: EmailRelationshipType,
  role: 'recipient' | 'actor' | 'subject' = 'recipient'
): string {
  // Start with the best available name
  let baseName = user.displayName || user.firstName || extractNameFromEmail(user.email);
  
  // Add relationship context for actors (not for recipients talking about themselves)
  if (role === 'actor' && relationship === 'actor-recipient') {
    // For actor-recipient relationships, make it personal
    return `Your neighbor ${baseName}`;
  } else if (role === 'actor' && relationship === 'requester-provider') {
    // For skill exchanges, keep it simple but friendly
    return baseName;
  }
  
  return baseName;
}

/**
 * Extract a reasonable name from an email address if no other name is available
 * email@domain.com → "Email" (capitalized)
 */
function extractNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  // Handle common email patterns
  const cleanName = localPart
    .replace(/[._+-]/g, ' ')  // Replace separators with spaces
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()) // Capitalize each word
    .join(' ');
  
  return cleanName || 'Neighbor'; // Fallback to generic term
}

// =============================================================================
// URL GENERATION FUNCTIONS  
// =============================================================================

/**
 * Generate email URLs with consistent UTM tracking
 * This ensures all email links are properly tracked and formatted
 */
export function generateEmailUrl(
  urlType: EmailUrlType,
  config: EmailUrlConfig,
  additionalParams?: Record<string, string>
): string {
  let path = '';
  
  // Map URL types to actual paths
  switch (urlType) {
    case 'dashboard':
      path = '/dashboard';
      break;
    case 'calendar':
      path = '/calendar';
      break;
    case 'skills':
      path = '/skills';
      break;
    case 'goods':
      path = '/goods';
      break;
    case 'safety':
      path = '/safety';
      break;
    case 'neighbors':
      path = '/neighbors';
      break;
    case 'settings':
      path = '/settings';
      break;
    case 'unsubscribe':
      path = '/unsubscribe';
      break;
    case 'profile':
      path = '/profile';
      break;
    case 'invite':
      path = '/invite';
      break;
    default:
      path = '/dashboard';
  }
  
  // Build the full URL with UTM parameters
  const url = new URL(path, config.baseUrl);
  
  // Add standard UTM parameters
  url.searchParams.set('utm_source', config.utmSource);
  url.searchParams.set('utm_medium', config.utmMedium);
  url.searchParams.set('utm_campaign', config.utmCampaign);
  
  // Add recipient tracking if available
  if (config.recipientId) {
    url.searchParams.set('utm_content', `recipient_${config.recipientId}`);
  }
  
  // Add any additional parameters
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}

/**
 * Generate content-specific URLs (for events, skills, etc.)
 */
function generateContentUrl(content: ContentReference, config: EmailUrlConfig): string {
  let basePath = '';
  
  switch (content.type) {
    case 'event':
      basePath = `/calendar/event/${content.id}`;
      break;
    case 'skill_exchange':
      basePath = `/skills/${content.id}`;
      break;
    case 'goods_exchange':
      basePath = `/goods/${content.id}`;
      break;
    case 'safety_update':
      basePath = `/safety/${content.id}`;
      break;
    case 'neighbor_profile':
      basePath = `/neighbors/${content.id}`;
      break;
    default:
      basePath = '/dashboard';
  }
  
  const url = new URL(basePath, config.baseUrl);
  
  // Add UTM parameters
  url.searchParams.set('utm_source', config.utmSource);
  url.searchParams.set('utm_medium', config.utmMedium);
  url.searchParams.set('utm_campaign', config.utmCampaign);
  
  if (config.recipientId) {
    url.searchParams.set('utm_content', `recipient_${config.recipientId}`);
  }
  
  return url.toString();
}

/**
 * Generate admin-specific URLs (member directory, admin dashboard, etc.)
 */
function generateAdminUrl(context: EmailContext, config: EmailUrlConfig): string {
  // For admin notifications, usually want to go to the relevant admin interface
  let adminPath = '';
  
  switch (context.content.type) {
    case 'neighbor_profile':
      adminPath = '/neighbors'; // Member directory
      break;
    case 'event':
      adminPath = '/calendar?view=admin';
      break;
    default:
      adminPath = '/dashboard?view=admin';
  }
  
  const url = new URL(adminPath, config.baseUrl);
  url.searchParams.set('utm_source', config.utmSource);
  url.searchParams.set('utm_medium', config.utmMedium);
  url.searchParams.set('utm_campaign', config.utmCampaign);
  
  if (config.recipientId) {
    url.searchParams.set('utm_content', `admin_${config.recipientId}`);
  }
  
  return url.toString();
}

// =============================================================================
// CONTENT GENERATION HELPERS
// =============================================================================

/**
 * Generate action descriptions for actor-recipient emails
 */
function generateActionDescription(context: EmailContext): string {
  const contentType = context.content.type;
  const actorName = context.actor ? resolveUserDisplayName(context.actor, context.relationship, 'actor') : 'Someone';
  
  // This could be made more sophisticated with templates
  switch (contentType) {
    case 'event':
      return `${actorName} commented on your event`;
    case 'skill_exchange':
      return `${actorName} responded to your skill post`;
    case 'safety_update':
      return `${actorName} commented on your safety update`;
    default:
      return `${actorName} interacted with your ${contentType.replace('_', ' ')}`;
  }
}

/**
 * Generate activity descriptions for admin notifications
 */
function generateAdminActivityDescription(context: EmailContext): string {
  const subjectName = context.subject ? resolveUserDisplayName(context.subject, context.relationship, 'subject') : 'Someone';
  
  switch (context.content.type) {
    case 'neighbor_profile':
      return `${subjectName} joined your neighborhood`;
    case 'event':
      return `${subjectName} created a new event`;
    default:
      return `New ${context.content.type.replace('_', ' ')} activity`;
  }
}

/**
 * Generate appropriate CTA text based on context
 */
function generateCtaText(context: EmailContext): string {
  switch (context.content.type) {
    case 'event':
      return 'View Event';
    case 'skill_exchange':
      return 'View Skill Post';
    case 'safety_update':
      return 'View Safety Update';
    case 'goods_exchange':
      return 'View Item';
    default:
      return 'View Details';
  }
}

/**
 * Generate admin-specific CTA text
 */
function generateAdminCtaText(context: EmailContext): string {
  switch (context.content.type) {
    case 'neighbor_profile':
      return 'View Member Directory';
    case 'event':
      return 'View All Events';
    default:
      return 'View Admin Dashboard';
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extract name from email address format: "Name <email@domain.com>" → "Name"
 */
function extractNameFromAddress(fromAddress: string): string {
  const match = fromAddress.match(/^(.+)\s*<.+>$/);
  return match ? match[1].trim() : 'neighborhoodOS';
}

/**
 * Extract email from address format: "Name <email@domain.com>" → "email@domain.com"
 */
function extractEmailFromAddress(fromAddress: string): string {
  const match = fromAddress.match(/<(.+)>$/);
  return match ? match[1].trim() : fromAddress;
}

/**
 * Template variable replacement
 * Replaces {{variableName}} with actual values
 */
export function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    return variables[variableName] || match; // Keep original if variable not found
  });
}

/**
 * Generate email subject using template and context
 */
export function generateEmailSubject(templateType: string, context: EmailContext): string {
  const templateConfig = getEmailTemplateConfig(templateType as any);
  const subjectTemplate = templateConfig?.subjectTemplate || `Update from ${context.neighborhood.name}`;
  
  const variables = {
    recipientName: resolveUserDisplayName(context.recipient, context.relationship, 'recipient'),
    actorName: context.actor ? resolveUserDisplayName(context.actor, context.relationship, 'actor') : '',
    subjectName: context.subject ? resolveUserDisplayName(context.subject, context.relationship, 'subject') : '',
    neighborhoodName: context.neighborhood.name,
    contentTitle: context.content.title,
  };
  
  return replaceTemplateVariables(subjectTemplate, variables);
}
