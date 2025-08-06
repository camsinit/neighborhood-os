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