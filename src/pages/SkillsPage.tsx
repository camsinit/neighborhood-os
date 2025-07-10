
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSkillsStore } from '@/stores/skillsStore';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { useDeepLinkHandler } from '@/hooks/useDeepLinkHandler';
import { useSkillsOnboarding } from '@/hooks/useSkillsOnboarding';
import { createLogger } from '@/utils/logger';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import ModuleLayout from '@/components/layout/ModuleLayout';
import SkillsPageContent from '@/components/skills/SkillsPageContent';
import AddSkillPopover from '@/components/skills/AddSkillPopover';
import { SkillsOnboardingOverlay } from '@/components/skills/SkillsOnboardingOverlay';
import { SkillsOnboardingDialog } from '@/components/skills/SkillsOnboardingDialog';
import { SkillsProvider } from '@/contexts/SkillsContext';
import { moduleThemeColors } from '@/theme/moduleTheme';

const logger = createLogger('SkillsPage');

/**
 * SkillsPage - Main page component for the Skills Exchange
 * 
 * This component implements a "contribute to view" approach where users must complete
 * skills onboarding before viewing neighborhood skills. Shows a blur overlay with
 * onboarding dialog until the user shares their own skills.
 * 
 * UPDATED: Added skills onboarding requirement with overlay and dialog system
 */
function SkillsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'offers';
  const category = searchParams.get('category') || null;
  const searchQuery = searchParams.get('q') || '';
  
  // State for the unified skill dialog
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  
  // State for skills onboarding
  const [isSkillsOnboardingOpen, setIsSkillsOnboardingOpen] = useState(false);
  
  // Skills onboarding hook
  const { 
    hasCompletedSkillsOnboarding, 
    isLoading: isOnboardingLoading, 
    error: onboardingError 
  } = useSkillsOnboarding();
  
  // Handle deep link parameters for direct navigation to skills
  const { hasDeepLink } = useDeepLinkHandler('skills');
  
  const highlightedSkill = useHighlightedItem('skills');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  const { setSearchQuery } = useSkillsStore();
  
  // Enhanced contextual navigation handling
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlTab = searchParams.get('tab');
    const urlQuery = searchParams.get('q');
    const highlightId = searchParams.get('highlight');
    const dialogParam = searchParams.get('dialog');
    
    // Set search query from URL
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }
    
    // Auto-open skill dialog if requested
    if (highlightId && dialogParam === 'true') {
      // Delay to ensure skill is highlighted first
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
  
  // Set up search from URL params (keeping existing functionality)
  useEffect(() => {
    setSearchQuery(searchQuery);
  }, [searchQuery, setSearchQuery]);
  
  // Log component mounting and deep link status
  useEffect(() => {
    logger.info('Component mounted, version: 2025-06-13');
    if (hasDeepLink) {
      logger.info('Deep link detected, will highlight skill when ready');
    }
  }, [hasDeepLink]);
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', value);
    // Clear category when changing tabs to avoid conflicts
    newParams.delete('category');
    setSearchParams(newParams);
  };
  
  // Handle category selection
  const handleCategoryClick = (selectedCategory: SkillCategory) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', selectedCategory);
    // Clear search when selecting category
    newParams.delete('q');
    setSearchParams(newParams);
  };
  
  // Handle back to categories
  const handleBackToCategories = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    newParams.delete('q');
    setSearchParams(newParams);
  };
  
  // Convert string category to SkillCategory type or undefined
  const getTypedCategory = (categoryString: string | null): SkillCategory | undefined => {
    if (!categoryString) return undefined;
    return categoryString as SkillCategory;
  };
  
  // Handle skill addition success
  const handleSkillAdded = () => {
    // Could add any additional logic here if needed
    logger.info('Skill added successfully from main page');
  };
  
  // Handle skills onboarding completion
  const handleSkillsOnboardingComplete = () => {
    setIsSkillsOnboardingOpen(false);
    logger.info('Skills onboarding completed successfully');
  };
  
  // Handle starting skills onboarding
  const handleStartSkillsOnboarding = () => {
    setIsSkillsOnboardingOpen(true);
  };
  
  // Show loading state while checking onboarding status
  if (isOnboardingLoading) {
    return (
      <ModuleLayout
        title="Skill Sharing"
        description="Share skills and knowledge with your neighbors to build a stronger, more connected community."
        themeColor="skills"
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ModuleLayout>
    );
  }
  
  return (
    <SkillsProvider>
      <ModuleLayout
        title="Skill Sharing"
        description="Share skills and knowledge with your neighbors to build a stronger, more connected community."
        themeColor="skills"
        showSkillsOnboardingOverlay={hasCompletedSkillsOnboarding === false}
      >
        <div 
          className="backdrop-blur-sm rounded-lg p-6 shadow-lg border relative"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: moduleThemeColors.skills.primary + '40',
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px ${moduleThemeColors.skills.primary}10`
          }}
        >
          {/* Skills onboarding overlay - show if user hasn't completed skills onboarding */}
          {hasCompletedSkillsOnboarding === false && (
            <SkillsOnboardingOverlay onStartOnboarding={handleStartSkillsOnboarding} />
          )}
          <SkillsPageContent
            view={view}
            category={category}
            searchQuery={searchQuery}
            searchParams={searchParams}
            searchInputRef={searchInputRef}
            handleTabChange={handleTabChange}
            handleCategoryClick={handleCategoryClick}
            handleBackToCategories={handleBackToCategories}
            getTypedCategory={getTypedCategory}
            setSearchParams={setSearchParams}
            setIsSkillDialogOpen={setIsSkillDialogOpen}
          />
        </div>
      </ModuleLayout>
      
      {/* Unified Add Skill Popover */}
      <AddSkillPopover
        open={isSkillDialogOpen}
        onOpenChange={setIsSkillDialogOpen}
        selectedCategory={getTypedCategory(category)} // Auto-populate with current category if viewing one
        onSkillAdded={handleSkillAdded}
      />
      
      {/* Skills Onboarding Dialog */}
      <SkillsOnboardingDialog
        open={isSkillsOnboardingOpen}
        onOpenChange={setIsSkillsOnboardingOpen}
        onComplete={handleSkillsOnboardingComplete}
      />
    </SkillsProvider>
  );
}

export default SkillsPage;
