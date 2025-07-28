/**
 * Timezone utility functions for neighborhood creation
 * 
 * This utility provides functions to detect user timezone and map it to 
 * appropriate timezone identifiers for neighborhood creation.
 */

/**
 * Gets the user's current timezone using the browser's Intl API
 * Falls back to a default timezone if detection fails
 */
export const getUserTimezone = (): string => {
  try {
    // Use browser's Intl API to detect timezone
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('[getUserTimezone] Detected timezone:', detectedTimezone);
    return detectedTimezone;
  } catch (error) {
    console.warn('[getUserTimezone] Failed to detect timezone, using default:', error);
    // Default to Pacific Time if detection fails
    return 'America/Los_Angeles';
  }
};

/**
 * Maps common US state abbreviations to their most common timezone
 * This provides a fallback when we have state information from waitlist data
 */
const STATE_TO_TIMEZONE_MAP: Record<string, string> = {
  // Pacific Time
  'CA': 'America/Los_Angeles',
  'WA': 'America/Los_Angeles',
  'OR': 'America/Los_Angeles',
  'NV': 'America/Los_Angeles',
  
  // Mountain Time
  'MT': 'America/Denver',
  'WY': 'America/Denver',
  'CO': 'America/Denver',
  'UT': 'America/Denver',
  'NM': 'America/Denver',
  'AZ': 'America/Phoenix', // Arizona doesn't observe DST
  'ID': 'America/Denver',
  
  // Central Time
  'TX': 'America/Chicago',
  'OK': 'America/Chicago',
  'KS': 'America/Chicago',
  'NE': 'America/Chicago',
  'SD': 'America/Chicago',
  'ND': 'America/Chicago',
  'MN': 'America/Chicago',
  'IA': 'America/Chicago',
  'MO': 'America/Chicago',
  'AR': 'America/Chicago',
  'LA': 'America/Chicago',
  'MS': 'America/Chicago',
  'AL': 'America/Chicago',
  'TN': 'America/Chicago',
  'KY': 'America/Chicago',
  'IN': 'America/New_York', // Most of Indiana is Eastern
  'IL': 'America/Chicago',
  'WI': 'America/Chicago',
  
  // Eastern Time
  'FL': 'America/New_York',
  'GA': 'America/New_York',
  'SC': 'America/New_York',
  'NC': 'America/New_York',
  'VA': 'America/New_York',
  'WV': 'America/New_York',
  'MD': 'America/New_York',
  'DE': 'America/New_York',
  'PA': 'America/New_York',
  'NJ': 'America/New_York',
  'NY': 'America/New_York',
  'CT': 'America/New_York',
  'RI': 'America/New_York',
  'MA': 'America/New_York',
  'VT': 'America/New_York',
  'NH': 'America/New_York',
  'ME': 'America/New_York',
  'OH': 'America/New_York',
  'MI': 'America/New_York',
  
  // Alaska & Hawaii
  'AK': 'America/Anchorage',
  'HI': 'Pacific/Honolulu'
};

/**
 * Gets timezone for a neighborhood based on state information
 * Falls back to user's detected timezone if state mapping isn't available
 */
export const getTimezoneForState = (state?: string): string => {
  if (state) {
    const upperState = state.toUpperCase();
    const mappedTimezone = STATE_TO_TIMEZONE_MAP[upperState];
    if (mappedTimezone) {
      console.log('[getTimezoneForState] Mapped state', state, 'to timezone:', mappedTimezone);
      return mappedTimezone;
    }
  }
  
  // Fall back to user's detected timezone
  const userTimezone = getUserTimezone();
  console.log('[getTimezoneForState] No mapping for state', state, 'using user timezone:', userTimezone);
  return userTimezone;
};