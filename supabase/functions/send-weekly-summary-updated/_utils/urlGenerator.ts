/**
 * UPDATED URL Generation Utilities for Weekly Digest Email Templates
 * 
 * This utility ensures all email links use consistent production URLs
 * with proper UTM tracking for analytics. Updated for current system.
 */

/**
 * Get the production base URL for email links
 * Always returns neighborhoodos.com for email consistency
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

// UPDATED: Weekly digest specific URL generators with current navigation
export const getWeeklySummaryEventsURL = (neighborhoodId?: string): string => {
  const baseUrl = neighborhoodId ? `/n/${neighborhoodId}/calendar` : '/calendar';
  return addEmailTrackingParams(`${getEmailBaseUrl()}${baseUrl}`, "weekly_summary_events", "email");
};

export const getWeeklySummarySkillsURL = (neighborhoodId?: string): string => {
  const baseUrl = neighborhoodId ? `/n/${neighborhoodId}/skills` : '/skills';
  return addEmailTrackingParams(`${getEmailBaseUrl()}${baseUrl}`, "weekly_summary_skills", "email");
};

// NEW: Groups URL generator
export const getWeeklySummaryGroupsURL = (neighborhoodId?: string): string => {
  const baseUrl = neighborhoodId ? `/n/${neighborhoodId}/groups` : '/groups';
  return addEmailTrackingParams(`${getEmailBaseUrl()}${baseUrl}`, "weekly_summary_groups", "email");
};

export const getWeeklySummarySafetyURL = (neighborhoodId?: string): string => {
  const baseUrl = neighborhoodId ? `/n/${neighborhoodId}/safety` : '/safety';
  return addEmailTrackingParams(`${getEmailBaseUrl()}${baseUrl}`, "weekly_summary_safety", "email");
};

export const getWeeklySummaryDashboardURL = (neighborhoodId?: string): string => {
  const baseUrl = neighborhoodId ? `/n/${neighborhoodId}` : '/dashboard';
  return addEmailTrackingParams(`${getEmailBaseUrl()}${baseUrl}`, "weekly_summary_dashboard", "email");
};

export const getWeeklySummarySettingsURL = (neighborhoodId?: string): string => {
  const baseUrl = neighborhoodId ? `/n/${neighborhoodId}/settings` : '/settings';
  return addEmailTrackingParams(`${getEmailBaseUrl()}${baseUrl}`, "weekly_summary_settings", "email");
};

// LEGACY: Keep goods URL for backward compatibility (even though not in main nav)
export const getWeeklySummaryGoodsURL = (neighborhoodId?: string): string => {
  const baseUrl = neighborhoodId ? `/n/${neighborhoodId}/goods` : '/goods';
  return addEmailTrackingParams(`${getEmailBaseUrl()}${baseUrl}`, "weekly_summary_goods", "email");
};

// Individual item URL generators with deep linking support
export const getProfileURL = (neighborhoodId: string, userId: string): string => {
  // Updated to use groups page for neighbors/directory
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/groups?view=directory&highlight=profile&type=profile&id=${userId}`;
  return addEmailTrackingParams(url, "weekly_summary_profile", "email");
};

export const getEventURL = (neighborhoodId: string, eventId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/calendar?highlight=event&type=event&id=${eventId}`;
  return addEmailTrackingParams(url, "weekly_summary_event", "email");
};

// NEW: Group URL generator
export const getGroupURL = (neighborhoodId: string, groupId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/groups?highlight=group&type=group&id=${groupId}`;
  return addEmailTrackingParams(url, "weekly_summary_group", "email");
};

export const getSkillURL = (neighborhoodId: string, skillId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/skills?highlight=skill&type=skills_exchange&id=${skillId}`;
  return addEmailTrackingParams(url, "weekly_summary_skill", "email");
};

export const getSafetyURL = (neighborhoodId: string, safetyId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/safety?highlight=safety&type=safety_updates&id=${safetyId}`;
  return addEmailTrackingParams(url, "weekly_summary_safety_item", "email");
};

// LEGACY: Keep goods URL for backward compatibility
export const getGoodsURL = (neighborhoodId: string, goodsId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/goods?highlight=goods&type=goods_exchange&id=${goodsId}`;
  return addEmailTrackingParams(url, "weekly_summary_goods_item", "email");
};
