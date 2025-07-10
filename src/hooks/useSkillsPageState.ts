import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSkillsStore } from '@/stores/skillsStore';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { useDeepLinkHandler } from '@/hooks/useDeepLinkHandler';
import { useSkillsOnboarding } from '@/hooks/useSkillsOnboarding';
import { createLogger } from '@/utils/logger';

const logger = createLogger('SkillsPageState');

/**
 * Custom hook that manages all state and effects for the Skills page
 * 
 * This hook centralizes the complex state management, URL parameter handling,
 * and side effects that were previously scattered throughout the SkillsPage component.
 * It provides a clean interface for the component to consume.
 */
export const useSkillsPageState = () => {
  // URL state management
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'offers';
  const category = searchParams.get('category') || null;
  const searchQuery = searchParams.get('q') || '';
  
  // Local component state
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isSkillsOnboardingOpen, setIsSkillsOnboardingOpen] = useState(false);
  
  // Refs for components that need direct access
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // External hooks and state
  const { setSearchQuery } = useSkillsStore();
  const { hasDeepLink } = useDeepLinkHandler('skills');
  const highlightedSkill = useHighlightedItem('skills');
  const { 
    hasCompletedSkillsOnboarding, 
    isLoading: isOnboardingLoading, 
    error: onboardingError 
  } = useSkillsOnboarding();

  // Enhanced contextual navigation handling
  // This effect manages deep linking and auto-opening of skill dialogs
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlTab = searchParams.get('tab');
    const urlQuery = searchParams.get('q');
    const highlightId = searchParams.get('highlight');
    const dialogParam = searchParams.get('dialog');
    
    // Set search query from URL parameters
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }
    
    // Auto-open skill dialog if requested via URL parameters
    if (highlightId && dialogParam === 'true') {
      // Delay to ensure skill is highlighted first and DOM is ready
      setTimeout(() => {
        const skillElement = document.querySelector(`[data-skill-id="${highlightId}"]`) as HTMLElement;
        if (skillElement) {
          skillElement.click(); // Trigger skill detail opening
          logger.info(`Auto-opened skill dialog for: ${highlightId}`);
        }
      }, 1500); // Longer delay for skills to ensure category loads first
    }
    
    logger.info('Skills page contextual navigation:', {
      category: urlCategory,
      tab: urlTab,
      query: urlQuery,
      highlight: highlightId,
      dialog: dialogParam
    });
  }, [searchParams, setSearchQuery]);
  
  // Sync search query with URL parameters
  // This ensures the search state stays in sync with URL changes
  useEffect(() => {
    setSearchQuery(searchQuery);
  }, [searchQuery, setSearchQuery]);
  
  // Component mounting and deep link logging
  // This helps with debugging navigation issues
  useEffect(() => {
    logger.info('Skills page state initialized, version: 2025-06-13');
    if (hasDeepLink) {
      logger.info('Deep link detected, will highlight skill when ready');
    }
  }, [hasDeepLink]);

  return {
    // URL state
    view,
    category,
    searchQuery,
    searchParams,
    setSearchParams,
    
    // Local state
    isSkillDialogOpen,
    setIsSkillDialogOpen,
    isSkillsOnboardingOpen,
    setIsSkillsOnboardingOpen,
    
    // Refs
    searchInputRef,
    
    // External state
    hasCompletedSkillsOnboarding,
    isOnboardingLoading,
    onboardingError,
    hasDeepLink,
    highlightedSkill,
  };
};