/**
 * URL Generation Utilities for Weekly Digest Email Templates
 * 
 * This utility ensures all email links use consistent production URLs
 * with proper UTM tracking for analytics
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

// Weekly digest specific URL generators with UTM tracking
export const getWeeklySummaryEventsURL = (): string => {
  return addEmailTrackingParams(`${getEmailBaseUrl()}/events`, "weekly_summary_events", "email");
};

export const getWeeklySummarySkillsURL = (): string => {
  return addEmailTrackingParams(`${getEmailBaseUrl()}/skills`, "weekly_summary_skills", "email");
};

export const getWeeklySummaryGoodsURL = (): string => {
  return addEmailTrackingParams(`${getEmailBaseUrl()}/goods`, "weekly_summary_goods", "email");
};

export const getWeeklySummarySafetyURL = (): string => {
  return addEmailTrackingParams(`${getEmailBaseUrl()}/safety`, "weekly_summary_safety", "email");
};

export const getWeeklySummaryDashboardURL = (): string => {
  return addEmailTrackingParams(`${getEmailBaseUrl()}/dashboard`, "weekly_summary_dashboard", "email");
};

export const getWeeklySummarySettingsURL = (): string => {
  return addEmailTrackingParams(`${getEmailBaseUrl()}/settings`, "weekly_summary_settings", "email");
};

// Individual item URL generators with deep linking support
export const getProfileURL = (neighborhoodId: string, userId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/neighbors?highlight=${userId}&type=neighbors&dialog=true`;
  return addEmailTrackingParams(url, "weekly_summary_profile", "email");
};

export const getEventURL = (neighborhoodId: string, eventId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/events?highlight=event&type=event&id=${eventId}`;
  return addEmailTrackingParams(url, "weekly_summary_event", "email");
};

export const getGoodsURL = (neighborhoodId: string, goodsId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/goods?highlight=goods&type=goods_exchange&id=${goodsId}`;
  return addEmailTrackingParams(url, "weekly_summary_goods_item", "email");
};

export const getSkillURL = (neighborhoodId: string, skillId: string, category?: string): string => {
  let url = `${getEmailBaseUrl()}/n/${neighborhoodId}/skills?highlight=skill&type=skills_exchange&id=${skillId}`;
  if (category) {
    url += `&category=${category}`;
  }
  return addEmailTrackingParams(url, "weekly_summary_skill", "email");
};

export const getGroupURL = (neighborhoodId: string, groupId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/groups?highlight=${groupId}&type=group&dialog=true`;
  return addEmailTrackingParams(url, "weekly_summary_group", "email");
};

export const getSafetyURL = (neighborhoodId: string, safetyId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/safety?highlight=safety&type=safety_updates&id=${safetyId}`;
  return addEmailTrackingParams(url, "weekly_summary_safety_item", "email");
};