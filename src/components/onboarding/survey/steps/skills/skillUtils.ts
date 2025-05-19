
/**
 * Utility functions for skill formatting and validation
 */

/**
 * Format skill detail input by properly capitalizing words and trimming whitespace
 * 
 * @param input User's input string
 * @returns Formatted string with proper capitalization
 */
export const formatSkillDetail = (input: string): string => {
  // Remove excess whitespace and split by commas
  const items = input
    .trim()
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
  
  // Capitalize first letter of each word in each item
  return items
    .map(item => 
      item.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
    )
    .join(', ');
};

/**
 * Convert skill detail input to an array of formatted detail items
 * 
 * @param input User's input string
 * @returns Array of formatted detail items
 */
export const parseSkillDetails = (input: string): string[] => {
  if (!input || input.trim() === '') return [];
  
  // Split by commas and format each item
  return input
    .trim()
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => 
      item.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
    );
};

/**
 * Create a combined skill string with specifics
 * 
 * @param skill Main skill name
 * @param details Specific details for the skill
 * @returns Formatted string combining skill and details
 */
export const formatSkillWithDetails = (skill: string, details: string): string => {
  if (!details || details.trim() === '') return skill;
  return `${skill}: ${formatSkillDetail(details)}`;
};

/**
 * Check if a skill is one that requires additional details
 * 
 * @param skill Skill name to check
 * @returns True if the skill needs additional details
 */
export const requiresDetails = (skill: string): boolean => {
  return !!skill && Object.keys(SKILLS_REQUIRING_DETAILS).includes(skill);
};

// Import the skills requiring details config
import { SKILLS_REQUIRING_DETAILS } from './skillCategories';
