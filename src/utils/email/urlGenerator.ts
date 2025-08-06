/**
 * URL Generation Utilities for Email Templates
 * 
 * This utility ensures all email links use consistent production URLs
 * that point to neighborhoodos.com regardless of the environment
 */

/**
 * Get the production base URL for email links
 * Always returns neighborhoodos.com for email consistency
 */
export const getEmailBaseUrl = (): string => {
  return "https://neighborhoodos.com";
};

/**
 * Generate deep links for email templates
 * These functions create properly formatted URLs for different app sections
 */

// Main navigation links
export const getHomeLink = (): string => {
  return `${getEmailBaseUrl()}/dashboard`;
};

export const getSkillsLink = (): string => {
  return `${getEmailBaseUrl()}/skills`;
};

export const getEventsLink = (): string => {
  return `${getEmailBaseUrl()}/events`;
};

export const getFreebiesLink = (): string => {
  return `${getEmailBaseUrl()}/goods`;
};

export const getUpdatesLink = (): string => {
  return `${getEmailBaseUrl()}/safety`;
};

export const getDirectoryLink = (): string => {
  return `${getEmailBaseUrl()}/neighbors`;
};

export const getModulesLink = (): string => {
  return `${getEmailBaseUrl()}/settings`;
};

// Action-specific links with CTA optimization
export const getCreateEventLink = (): string => {
  return `${getEmailBaseUrl()}/events/create`;
};

export const getInviteLink = (inviteCode: string): string => {
  return `${getEmailBaseUrl()}/join/${inviteCode}`;
};

export const getJoinNeighborhoodLink = (inviteCode: string): string => {
  return `${getEmailBaseUrl()}/join/${inviteCode}`;
};

export const getExploreNeighborhoodLink = (): string => {
  return `${getEmailBaseUrl()}/dashboard`;
};

// Utility function to add UTM parameters for email tracking
export const addEmailTrackingParams = (url: string, campaign: string, source: string = "email"): string => {
  const urlObj = new URL(url);
  urlObj.searchParams.set("utm_source", source);
  urlObj.searchParams.set("utm_medium", "email");
  urlObj.searchParams.set("utm_campaign", campaign);
  return urlObj.toString();
};

// Enhanced URL generators with UTM tracking for specific email campaigns
export const getOnboardingURL = (baseFunction: () => string, step: number): string => {
  return addEmailTrackingParams(baseFunction(), `onboarding_step_${step}`, "email");
};

export const getWelcomeURL = (baseFunction: () => string): string => {
  return addEmailTrackingParams(baseFunction(), "welcome_email", "email");
};

export const getInviteURL = (inviteCode: string): string => {
  return addEmailTrackingParams(getInviteLink(inviteCode), "neighbor_invite", "email");
};

// Weekly digest specific URL generators with UTM tracking
export const getWeeklySummaryURL = (section: string): string => {
  return addEmailTrackingParams(getHomeLink(), `weekly_summary_${section}`, "email");
};

export const getWeeklySummaryEventsURL = (): string => {
  return addEmailTrackingParams(getEventsLink(), "weekly_summary_events", "email");
};

export const getWeeklySummarySkillsURL = (): string => {
  return addEmailTrackingParams(getSkillsLink(), "weekly_summary_skills", "email");
};

export const getWeeklySummaryGoodsURL = (): string => {
  return addEmailTrackingParams(getFreebiesLink(), "weekly_summary_goods", "email");
};

export const getWeeklySummarySafetyURL = (): string => {
  return addEmailTrackingParams(getUpdatesLink(), "weekly_summary_safety", "email");
};

export const getWeeklySummarySettingsURL = (): string => {
  return addEmailTrackingParams(getModulesLink(), "weekly_summary_settings", "email");
};