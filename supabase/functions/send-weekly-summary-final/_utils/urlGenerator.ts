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
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/neighbors?detail=${userId}&type=neighbors`;
  return addEmailTrackingParams(url, "weekly_summary_profile", "email");
};

export const getEventURL = (neighborhoodId: string, eventId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/calendar?detail=${eventId}&type=event`;
  return addEmailTrackingParams(url, "weekly_summary_event", "email");
};

export const getGoodsURL = (neighborhoodId: string, goodsId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/goods?detail=${goodsId}&type=goods_exchange`;
  return addEmailTrackingParams(url, "weekly_summary_goods_item", "email");
};

export const getSkillURL = (neighborhoodId: string, category: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/skills?category=${category}`;
  return addEmailTrackingParams(url, "weekly_summary_skill", "email");
};

export const getGroupURL = (neighborhoodId: string, groupId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/neighbors?detail=${groupId}&type=group`;
  return addEmailTrackingParams(url, "weekly_summary_group", "email");
};

export const getSafetyURL = (neighborhoodId: string, safetyId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/safety?highlight=safety&type=safety_updates&id=${safetyId}`;
  return addEmailTrackingParams(url, "weekly_summary_safety_item", "email");
};

/**
 * Generate URL to auto-open event creation form
 *
 * @example
 * getCreateEventURL('uuid-123')
 * // => https://neighborhoodos.com/n/uuid-123/calendar?action=add&utm...
 *
 * Frontend expectation:
 * - CalendarPage checks for ?action=add parameter
 * - Opens event creation sheet immediately on mount
 * - Clears URL parameter after opening
 */
export const getCreateEventURL = (neighborhoodId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/calendar?action=add`;
  return addEmailTrackingParams(url, "weekly_summary_create_event", "email");
};

/**
 * Generate URL to auto-open skill offer creation form
 *
 * @example
 * getCreateSkillOfferURL('uuid-123')
 * // => https://neighborhoodos.com/n/uuid-123/skills?action=offer&utm...
 *
 * Frontend expectation:
 * - SkillsPage checks for ?action=offer parameter
 * - Opens SkillOfferSheet immediately on mount
 * - Clears URL parameter after opening
 */
export const getCreateSkillOfferURL = (neighborhoodId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/skills?action=offer`;
  return addEmailTrackingParams(url, "weekly_summary_create_skill", "email");
};

/**
 * Generate URL to auto-open skill request creation form
 *
 * @example
 * getCreateSkillRequestURL('uuid-123')
 * // => https://neighborhoodos.com/n/uuid-123/skills?action=request&utm...
 *
 * Frontend expectation:
 * - SkillsPage checks for ?action=request parameter
 * - Opens SkillRequestSheet immediately on mount
 * - Clears URL parameter after opening
 */
export const getCreateSkillRequestURL = (neighborhoodId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/skills?action=request`;
  return addEmailTrackingParams(url, "weekly_summary_request_skill", "email");
};

/**
 * Generate URL to auto-open group creation form
 *
 * @example
 * getCreateGroupURL('uuid-123')
 * // => https://neighborhoodos.com/n/uuid-123/neighbors?action=create&utm...
 *
 * Frontend expectation:
 * - GroupsPage checks for ?action=create parameter
 * - Opens CreateGroupForm immediately on mount
 * - Clears URL parameter after opening
 */
export const getCreateGroupURL = (neighborhoodId: string): string => {
  const url = `${getEmailBaseUrl()}/n/${neighborhoodId}/neighbors?action=create`;
  return addEmailTrackingParams(url, "weekly_summary_create_group", "email");
};