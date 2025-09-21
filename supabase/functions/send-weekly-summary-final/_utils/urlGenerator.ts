/**
 * FINAL URL Generation Utilities for Weekly Digest Email Templates
 * 
 * Updated to reflect CURRENT system state after recent deletions:
 * - Home, Calendar, Skills, Groups ONLY
 * - NO safety, NO goods (tables dropped)
 */

/**
 * Get the production base URL for email links
 */
export const getEmailBaseUrl = (): string => {
  return "https://neighborhoodos.com";
};

// Utility function to add UTM parameters for email tracking
export const addEmailTrackingParams = (url: string, campaign: string, source: string = "email"): string => {
  const urlObj = new URL(url);
  urlObj.searchParams.set("utm_source", source);
  urlObj.searchParams.set("utm_medium", "email");
  urlObj.searchParams.set("utm_campaign", campaign);
  return urlObj.toString();
};

// FINAL: Weekly digest URL generators - ONLY current features
export const getWeeklySummaryEventsURL = (neighborhoodId?: string): string => {
  const baseUrl = neighborhoodId ? `/n/${neighborhoodId}/calendar` : '/calendar';
  return addEmailTrackingParams(`${getEmailBaseUrl()}${baseUrl}`, "weekly_summary_events", "email");
};

export const getWeeklySummarySkillsURL = (neighborhoodId?: string): string => {
  const baseUrl = neighborhoodId ? `/n/${neighborhoodId}/skills` : '/skills';
  return addEmailTrackingParams(`${getEmailBaseUrl()}${baseUrl}`, "weekly_summary_skills", "email");
};

export const getWeeklySummaryGroupsURL = (neighborhoodId?: string): string => {
  const baseUrl = neighborhoodId ? `/n/${neighborhoodId}/groups` : '/groups';
  return addEmailTrackingParams(`${getEmailBaseUrl()}${baseUrl}`, "weekly_summary_groups", "email");
};

export const getWeeklySummaryDashboardURL = (neighborhoodId?: string): string => {
  const baseUrl = neighborhoodId ? `/n/${neighborhoodId}` : '/dashboard';
  return addEmailTrackingParams(`${getEmailBaseUrl()}${baseUrl}`, "weekly_summary_dashboard", "email");
};

export const getWeeklySummarySettingsURL = (neighborhoodId?: string): string => {
  const baseUrl = neighborhoodId ? `/n/${neighborhoodId}/settings` : '/settings';
  return addEmailTrackingParams(`${getEmailBaseUrl()}${baseUrl}`, "weekly_summary_settings", "email");
};

// Individual item URL generators - ONLY current features
export const getProfileURL = (neighborhoodId: string, userId: string): string => {
  // Groups page has directory view for neighbors
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/groups?view=directory&highlight=profile&type=profile&id=${userId}`;
  return addEmailTrackingParams(url, "weekly_summary_profile", "email");
};

export const getEventURL = (neighborhoodId: string, eventId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/calendar?highlight=event&type=event&id=${eventId}`;
  return addEmailTrackingParams(url, "weekly_summary_event", "email");
};

export const getGroupURL = (neighborhoodId: string, groupId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/groups?highlight=group&type=group&id=${groupId}`;
  return addEmailTrackingParams(url, "weekly_summary_group", "email");
};

export const getSkillURL = (neighborhoodId: string, skillId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/skills?highlight=skill&type=skills_exchange&id=${skillId}`;
  return addEmailTrackingParams(url, "weekly_summary_skill", "email");
};

// REMOVED: Safety and Goods URL generators (tables dropped)
// export const getSafetyURL = ...  // NO LONGER EXISTS
// export const getGoodsURL = ...   // NO LONGER EXISTS
