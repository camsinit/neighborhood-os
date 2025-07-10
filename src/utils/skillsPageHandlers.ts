import { SkillCategory } from '@/components/skills/types/skillTypes';
import { createLogger } from '@/utils/logger';

const logger = createLogger('SkillsPageHandlers');

/**
 * Utility functions for handling Skills page interactions
 * 
 * These functions encapsulate the business logic for various user interactions
 * on the Skills page, keeping the component clean and focused on rendering.
 */

/**
 * Creates a handler for tab changes that updates URL parameters
 * @param setSearchParams - Function to update URL search parameters
 */
export const createTabChangeHandler = (
  setSearchParams: (params: URLSearchParams) => void,
  searchParams: URLSearchParams
) => {
  return (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', value);
    // Clear category when changing tabs to avoid conflicts
    newParams.delete('category');
    setSearchParams(newParams);
  };
};

/**
 * Creates a handler for category selection that updates URL parameters
 * @param setSearchParams - Function to update URL search parameters
 */
export const createCategoryClickHandler = (
  setSearchParams: (params: URLSearchParams) => void,
  searchParams: URLSearchParams
) => {
  return (selectedCategory: SkillCategory) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', selectedCategory);
    // Clear search when selecting category to show category-specific results
    newParams.delete('q');
    setSearchParams(newParams);
  };
};

/**
 * Creates a handler for returning to the categories view
 * @param setSearchParams - Function to update URL search parameters
 */
export const createBackToCategoriesHandler = (
  setSearchParams: (params: URLSearchParams) => void,
  searchParams: URLSearchParams
) => {
  return () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    newParams.delete('q');
    setSearchParams(newParams);
  };
};

/**
 * Converts a string category to a typed SkillCategory or undefined
 * This provides type safety when working with URL parameters
 */
export const getTypedCategory = (categoryString: string | null): SkillCategory | undefined => {
  if (!categoryString) return undefined;
  return categoryString as SkillCategory;
};

/**
 * Creates a handler for successful skill addition
 * Currently just logs the action, but can be extended for additional functionality
 */
export const createSkillAddedHandler = () => {
  return () => {
    logger.info('Skill added successfully from main page');
    // Additional logic for skill addition can be added here
    // e.g., showing success toast, updating analytics, etc.
  };
};

/**
 * Creates a handler for skills onboarding completion
 * @param setIsSkillsOnboardingOpen - Function to close the onboarding dialog
 */
export const createSkillsOnboardingCompleteHandler = (
  setIsSkillsOnboardingOpen: (open: boolean) => void
) => {
  return () => {
    setIsSkillsOnboardingOpen(false);
    logger.info('Skills onboarding completed successfully');
  };
};

/**
 * Creates a handler for starting skills onboarding
 * @param setIsSkillsOnboardingOpen - Function to open the onboarding dialog
 */
export const createStartSkillsOnboardingHandler = (
  setIsSkillsOnboardingOpen: (open: boolean) => void
) => {
  return () => {
    setIsSkillsOnboardingOpen(true);
  };
};