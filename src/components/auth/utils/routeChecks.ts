
/**
 * Utility functions for route checking logic
 * 
 * Contains helper functions to determine what type of page we're on
 * and what redirects should happen.
 */
import { Location } from "react-router-dom";

/**
 * Check if the current path is a join page
 */
export const isJoinPage = (location: Location): boolean => {
  return location.pathname === '/join' || location.pathname.startsWith('/join/');
};

/**
 * Check if the current path is the home page (legacy or neighborhood-aware)
 */
export const isHomePage = (location: Location): boolean => {
  return location.pathname === '/home' || location.pathname.includes('/home');
};

/**
 * Check if the current path is the onboarding page
 */
export const isOnboardingPage = (location: Location): boolean => {
  return location.pathname === '/onboarding';
};
