/**
 * useActivityGroupUrlState Hook
 *
 * Extends the URL sheet state pattern to handle activity groups.
 * This enables deep linking to side panels that show grouped activities
 * (like when a neighbor adds multiple skills and they get grouped together).
 *
 * URL Pattern: ?detail=group-{groupId}&type=activity_group
 * Example: ?detail=group-f002afd9-be6d-492c-98a6-6501b2f25e48-skills&type=activity_group
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ActivityGroup } from '@/utils/activityGrouping';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useActivityGroupUrlState');

interface UseActivityGroupUrlStateReturn {
  /** Whether the activity group sheet should be open */
  isSheetOpen: boolean;
  /** The group ID from the URL */
  groupId: string | null;
  /** The activity group being displayed */
  activeGroup: ActivityGroup | null;
  /** Function to open sheet with activity group */
  openGroupSheet: (group: ActivityGroup) => void;
  /** Function to close the sheet */
  closeGroupSheet: () => void;
}

export function useActivityGroupUrlState(
  availableGroups: ActivityGroup[]
): UseActivityGroupUrlStateReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeGroup, setActiveGroup] = useState<ActivityGroup | null>(null);

  // Get the detail ID and type from URL parameters
  const detailParam = searchParams.get('detail');
  const typeParam = searchParams.get('type');

  // Extract group ID if this is an activity group URL
  const groupId = detailParam && typeParam === 'activity_group' && detailParam.startsWith('group-')
    ? detailParam
    : null;

  // Sheet should be open if we have a valid activity group URL
  const isSheetOpen = Boolean(groupId && typeParam === 'activity_group');

  // Effect to find and set the active group based on URL
  useEffect(() => {
    if (groupId && availableGroups.length > 0) {
      // Find the group by ID
      const group = availableGroups.find(g => createGroupUrlId(g) === groupId);

      if (group) {
        setActiveGroup(group);
        logger.info(`Found activity group for URL ID: ${groupId}`, group);
      } else {
        logger.warn(`No activity group found for URL ID: ${groupId}`);
        setActiveGroup(null);
      }
    } else if (!groupId) {
      // Clear active group when no group ID
      setActiveGroup(null);
    }
  }, [groupId, availableGroups]);

  // Function to create a consistent URL ID for activity groups
  const createGroupUrlId = (group: ActivityGroup): string => {
    if (group.type === 'single') {
      return `group-${group.id}`;
    }

    // For grouped activities, create ID based on user and activity type
    const primaryActivity = group.primaryActivity;
    const activityType = primaryActivity.activity_type.replace('_', '-');
    return `group-${primaryActivity.actor_id}-${activityType}`;
  };

  // Function to open sheet with activity group
  const openGroupSheet = (group: ActivityGroup) => {
    const groupUrlId = createGroupUrlId(group);
    logger.info(`Opening activity group sheet: ${groupUrlId}`, group);

    // Set active group immediately for responsive UI
    setActiveGroup(group);

    // Update URL to include group parameters
    const newParams = new URLSearchParams(searchParams);
    newParams.set('detail', groupUrlId);
    newParams.set('type', 'activity_group');
    setSearchParams(newParams);
  };

  // Function to close the sheet
  const closeGroupSheet = () => {
    logger.info('Closing activity group sheet');

    // Clear active group
    setActiveGroup(null);

    // Remove parameters from URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('detail');
    newParams.delete('type');
    setSearchParams(newParams);
  };

  return {
    isSheetOpen,
    groupId,
    activeGroup,
    openGroupSheet,
    closeGroupSheet
  };
}