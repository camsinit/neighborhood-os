/**
 * Content type configuration for notification filtering
 * 
 * This centralized config prevents the need to update multiple places
 * when adding new content types to the notification system.
 */

export interface ContentTypeConfig {
  table: string;
  neighborhoodKey: string;
  join?: string;
  // Enhanced configuration for notifications and activities
  actorField: string; // Field that contains the user ID who performed the action
  activityTypes: {
    create: string; // Activity type when content is created
    update?: string; // Activity type when content is updated (optional)
  };
  notificationTemplate?: string; // Default notification template ID
}

export const CONTENT_TYPE_CONFIG: Record<string, ContentTypeConfig> = {
  events: { 
    table: 'events', 
    neighborhoodKey: 'neighborhood_id',
    actorField: 'host_id',
    activityTypes: {
      create: 'event_created'
    },
    notificationTemplate: 'event_created'
  },
  safety_updates: { 
    table: 'safety_updates', 
    neighborhoodKey: 'neighborhood_id',
    actorField: 'author_id',
    activityTypes: {
      create: 'safety_update'
    },
    notificationTemplate: 'safety_update'
  },
  skills_exchange: { 
    table: 'skills_exchange', 
    neighborhoodKey: 'neighborhood_id',
    actorField: 'user_id',
    activityTypes: {
      create: 'skill_offered' // This will be determined dynamically based on request_type
    },
    notificationTemplate: 'skill_exchange'
  },
  goods_exchange: { 
    table: 'goods_exchange', 
    neighborhoodKey: 'neighborhood_id',
    actorField: 'user_id',
    activityTypes: {
      create: 'good_shared' // This will be determined dynamically based on request_type
    },
    notificationTemplate: 'goods_exchange'
  },
  groups: { 
    table: 'groups', 
    neighborhoodKey: 'neighborhood_id',
    actorField: 'created_by',
    activityTypes: {
      create: 'group_created'
    },
    notificationTemplate: 'group_invitation'
  },
  group_updates: { 
    table: 'group_updates', 
    neighborhoodKey: 'groups.neighborhood_id',
    join: 'groups!inner(neighborhood_id)',
    actorField: 'user_id',
    activityTypes: {
      create: 'group_update_created'
    },
    notificationTemplate: 'group_update_posted'
  },
};

/**
 * Build the join clause for the main notification query
 */
export function buildJoinClause(): string {
  return Object.values(CONTENT_TYPE_CONFIG)
    .map(config => {
      const joinPart = config.join?.replace('!inner', '') || 'neighborhood_id';
      return `${config.table}!inner(${joinPart})`;
    })
    .join(',');
}

/**
 * Build the OR condition for neighborhood filtering
 */
export function buildOrCondition(neighborhoodId: string): string {
  return Object.values(CONTENT_TYPE_CONFIG)
    .map(config => `${config.table}.${config.neighborhoodKey}.eq.${neighborhoodId}`)
    .join(',');
}

/**
 * Get content type configuration by content type
 */
export function getContentTypeConfig(contentType: string): ContentTypeConfig | undefined {
  return CONTENT_TYPE_CONFIG[contentType];
}

/**
 * Get all supported content types
 */
export function getSupportedContentTypes(): string[] {
  return Object.keys(CONTENT_TYPE_CONFIG);
}

/**
 * Get the actor field name for a content type
 */
export function getActorField(contentType: string): string | undefined {
  return CONTENT_TYPE_CONFIG[contentType]?.actorField;
}

/**
 * Get the activity type for a content action
 */
export function getActivityType(contentType: string, action: 'create' | 'update' = 'create'): string | undefined {
  return CONTENT_TYPE_CONFIG[contentType]?.activityTypes[action];
}

/**
 * Get the notification template for a content type
 */
export function getNotificationTemplate(contentType: string): string | undefined {
  return CONTENT_TYPE_CONFIG[contentType]?.notificationTemplate;
}