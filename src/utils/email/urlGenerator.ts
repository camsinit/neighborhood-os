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

// Action-specific links
export const getCreateEventLink = (): string => {
  return `${getEmailBaseUrl()}/events/create`;
};

export const getInviteLink = (inviteCode: string): string => {
  return `${getEmailBaseUrl()}/join/${inviteCode}`;
};

// Utility function to add UTM parameters for email tracking
export const addEmailTrackingParams = (url: string, campaign: string, source: string = "email"): string => {
  const urlObj = new URL(url);
  urlObj.searchParams.set("utm_source", source);
  urlObj.searchParams.set("utm_medium", "email");
  urlObj.searchParams.set("utm_campaign", campaign);
  return urlObj.toString();
};