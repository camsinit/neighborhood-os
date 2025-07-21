/**
 * Unified Email Parameter Types
 * 
 * This file defines all the shared interfaces and types used across email templates
 * to ensure consistency and type safety in our email system.
 */

// =============================================================================
// CORE USER IDENTITY TYPES
// =============================================================================

/**
 * Enhanced user profile for email context
 * Provides all the information needed to personalize emails properly
 */
export interface EmailUserProfile {
  id: string;
  email: string;
  /** Preferred display name - falls back to firstName or email if null */
  displayName?: string | null;
  /** First name from auth or profile */
  firstName?: string | null;
  /** Avatar URL for email signatures or visual elements */
  avatarUrl?: string | null;
  /** Whether this user prefers to show their email in directory */
  emailVisible?: boolean;
}

/**
 * Neighborhood context for emails
 * Contains all neighborhood-specific information needed for personalization
 */
export interface NeighborhoodEmailContext {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  /** Total number of active members */
  memberCount: number;
  /** When the neighborhood was created */
  createdAt: string;
  /** ID of the neighborhood creator */
  createdBy: string;
}

// =============================================================================
// EMAIL RELATIONSHIP TYPES
// =============================================================================

/**
 * Defines the relationship dynamics in emails
 * This determines how the email is personalized and what perspective it takes
 */
export type EmailRelationshipType = 
  | 'actor-recipient'     // Someone did something that affects the recipient (comment, RSVP, etc.)
  | 'requester-provider'  // Someone is asking for help from someone who can provide it
  | 'admin-member'        // Admin notification about community activity  
  | 'system-broadcast'    // General community updates, no specific relationships
  | 'self-notification';  // User gets notified about their own content (confirmations, etc.)

/**
 * Complete email context including relationship dynamics
 * This is the main interface that email parameter resolver will produce
 */
export interface EmailContext {
  // WHO is involved in this email
  relationship: EmailRelationshipType;
  actor?: EmailUserProfile;      // Person who took the action (optional for system emails)
  recipient: EmailUserProfile;   // Person receiving the email
  subject?: EmailUserProfile;    // Third party mentioned in the email (new member, etc.)
  
  // WHAT they're talking about  
  content: ContentReference;
  
  // WHERE this is happening
  neighborhood: NeighborhoodEmailContext;
  
  // WHEN this happened (for time-sensitive messaging)
  timestamp: string;
}

/**
 * Reference to the content that triggered the email
 * This helps generate appropriate links and context
 */
export interface ContentReference {
  id: string;
  type: ContentType;
  title: string;
  /** Additional context specific to the content type */
  metadata?: Record<string, any>;
}

export type ContentType = 
  | 'event'
  | 'skill_exchange' 
  | 'goods_exchange'
  | 'care_request'
  | 'safety_update'
  | 'neighbor_profile'
  | 'invitation'
  | 'neighborhood';

// =============================================================================
// TEMPLATE-SPECIFIC INTERFACES  
// =============================================================================

/**
 * Base interface that all email templates should extend
 * Provides consistent branding and URL generation
 */
export interface BaseEmailProps {
  // Core personalization
  recipientName: string;  // Resolved display name with proper fallbacks
  neighborhoodName: string;
  
  // Consistent branding
  baseUrl: string;
  fromName: string;
  fromEmail: string;
  
  // UTM tracking
  utmCampaign: string;
  utmSource: string;
  utmMedium: string;
  
  // Standard links (with UTM parameters)
  homeUrl: string;
  unsubscribeUrl: string;
  settingsUrl: string;
}

/**
 * For emails involving actor → recipient relationships
 * Like comments, RSVPs, skill requests, etc.
 */
export interface ActorRecipientEmailProps extends BaseEmailProps {
  // The person who took the action
  actorName: string;           // "Your neighbor Sarah" or just "Sarah" 
  actorAvatarUrl?: string;
  
  // The action and its context
  actionDescription: string;   // "commented on your event"
  contentTitle: string;        // "Block Party Planning"
  contentUrl: string;          // Link to view the specific content
  
  // Call to action
  primaryCtaText: string;      // "View Comment"
  primaryCtaUrl: string;
}

/**
 * For administrative notifications to neighborhood admins
 */
export interface AdminNotificationEmailProps extends BaseEmailProps {
  // What happened in the community
  activityDescription: string; // "New member joined" 
  subjectName?: string;        // "John Smith" (the person who joined)
  
  // Admin-specific context
  adminCtaText: string;        // "View Member Directory"
  adminCtaUrl: string;         // Link to admin interface
  
  // Community stats for context
  communityStats?: {
    totalMembers: number;
    weeklyActivity: number;
  };
}

/**
 * For system-wide broadcasts like weekly summaries
 */
export interface SystemBroadcastEmailProps extends BaseEmailProps {
  // Personalized opening
  personalizedGreeting: string; // "Hi Sarah, here's what happened this week in Maple Street"
  
  // Structured content sections
  sections: EmailContentSection[];
  
  // Community engagement
  callToAction: {
    text: string;
    url: string;
    description: string;
  };
}

export interface EmailContentSection {
  title: string;
  content: string;
  items?: Array<{
    title: string;
    description: string;
    url?: string;
  }>;
}

// =============================================================================
// URL GENERATION TYPES
// =============================================================================

/**
 * Configuration for generating email URLs with proper tracking
 */
export interface EmailUrlConfig {
  baseUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  recipientId?: string;  // For personalized tracking
}

/**
 * Standard URL types that emails commonly need
 */
export type EmailUrlType = 
  | 'dashboard'
  | 'calendar' 
  | 'skills'
  | 'goods'
  | 'safety'
  | 'neighbors'
  | 'settings'
  | 'unsubscribe'
  | 'profile'
  | 'invite';

// =============================================================================
// EMAIL TEMPLATE METADATA
// =============================================================================

/**
 * Metadata about email templates for better organization
 */
export interface EmailTemplateMetadata {
  templateId: string;
  templateName: string;
  relationship: EmailRelationshipType;
  supportedContentTypes: ContentType[];
  requiredData: string[];        // List of required fields from EmailContext
  defaultFromAddress: string;
  defaultSubjectPattern: string; // Template with {{variables}}
}