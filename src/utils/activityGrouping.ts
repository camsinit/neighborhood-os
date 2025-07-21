
import { Activity } from "@/hooks/useActivities";

/**
 * Group activities by user, type, and timestamp proximity
 * Groups activities that occur within 1 minute of each other from the same user and type
 */
export interface ActivityGroup {
  id: string; // Unique identifier for the group
  type: 'grouped' | 'single';
  activities: Activity[];
  primaryActivity: Activity; // The "representative" activity for the group
  count: number;
}

/**
 * Groups activities that are similar and close in time
 * Returns an array of ActivityGroup objects that can contain single or multiple activities
 */
export const groupActivities = (activities: Activity[]): ActivityGroup[] => {
  const groups: ActivityGroup[] = [];
  const processed = new Set<string>();

  for (const activity of activities) {
    // Skip if this activity has already been grouped
    if (processed.has(activity.id)) continue;

    // Find similar activities within 1 minute window
    const similarActivities = activities.filter(other => {
      if (processed.has(other.id) || other.id === activity.id) return false;
      
      // Must be same user and same activity type
      if (other.actor_id !== activity.actor_id || other.activity_type !== activity.activity_type) {
        return false;
      }
      
      // Must be within 1 minute of each other
      const timeDiff = Math.abs(
        new Date(other.created_at).getTime() - new Date(activity.created_at).getTime()
      );
      return timeDiff <= 60000; // 1 minute in milliseconds
    });

    // Create group with the primary activity plus similar ones
    const groupActivities = [activity, ...similarActivities];
    
    // Only group if we have 3 or more activities
    if (groupActivities.length >= 3) {
      groups.push({
        id: `group-${activity.id}`,
        type: 'grouped',
        activities: groupActivities,
        primaryActivity: activity, // Use first activity as representative
        count: groupActivities.length
      });
      
      // Mark all activities in this group as processed
      groupActivities.forEach(a => processed.add(a.id));
    } else {
      // Not enough for a group, treat as single activity
      groups.push({
        id: activity.id,
        type: 'single',
        activities: [activity],
        primaryActivity: activity,
        count: 1
      });
      processed.add(activity.id);
    }
  }

  return groups;
};

/**
 * Get a descriptive text for a grouped activity
 */
export const getGroupedActivityText = (group: ActivityGroup): string => {
  if (group.type === 'single') return group.primaryActivity.title;
  
  const { activity_type, count } = { 
    activity_type: group.primaryActivity.activity_type, 
    count: group.count 
  };
  
  switch (activity_type) {
    case 'skill_offered':
      return `offered ${count} skills`;
    case 'skill_requested':
      return `requested help with ${count} skills`;
    case 'good_shared':
      return `shared ${count} items`;
    case 'good_requested':
      return `requested ${count} items`;
    case 'event_created':
      return `created ${count} events`;
    default:
      return `made ${count} updates`;
  }
};
