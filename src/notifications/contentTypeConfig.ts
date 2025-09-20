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
}

export const CONTENT_TYPE_CONFIG: Record<string, ContentTypeConfig> = {
  events: { 
    table: 'events', 
    neighborhoodKey: 'neighborhood_id' 
  },
  safety_updates: { 
    table: 'safety_updates', 
    neighborhoodKey: 'neighborhood_id' 
  },
  skills_exchange: { 
    table: 'skills_exchange', 
    neighborhoodKey: 'neighborhood_id' 
  },
  goods_exchange: { 
    table: 'goods_exchange', 
    neighborhoodKey: 'neighborhood_id' 
  },
  group_updates: { 
    table: 'group_updates', 
    neighborhoodKey: 'groups.neighborhood_id',
    join: 'groups!inner(neighborhood_id)'
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