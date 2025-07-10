import React from 'react';
import { useSkillsPageState } from '@/hooks/useSkillsPageState';
import { 
  createTabChangeHandler,
  createCategoryClickHandler,
  createBackToCategoriesHandler,
  getTypedCategory,
  createSkillAddedHandler,
  createSkillsOnboardingCompleteHandler
} from '@/utils/skillsPageHandlers';
import ModuleLayout from '@/components/layout/ModuleLayout';
import SkillsPageContent from '@/components/skills/SkillsPageContent';
import AddSkillPopover from '@/components/skills/AddSkillPopover';
import { SkillsProvider } from '@/contexts/SkillsContext';
import { moduleThemeColors } from '@/theme/moduleTheme';

/**
 * SkillsPage - Main page component for the Skills Exchange
 * 
 * This component implements a "contribute to view" approach where users must complete
 * skills onboarding before viewing neighborhood skills. Shows a blur overlay with
 * onboarding dialog until the user shares their own skills.
 * 
 * REFACTORED: Extracted state management and handlers into separate modules
 * for better maintainability and testability.
 */
function SkillsPage() {
  // Get all state and derived values from custom hook
  const {
    view,
    category,
    searchQuery,
    searchParams,
    setSearchParams,
    isSkillDialogOpen,
    setIsSkillDialogOpen,
    searchInputRef,
    hasCompletedSkillsOnboarding,
    isOnboardingLoading,
    onboardingError
  } = useSkillsPageState();

  // Create handler functions using the utility factory functions
  const handleTabChange = createTabChangeHandler(setSearchParams, searchParams);
  const handleCategoryClick = createCategoryClickHandler(setSearchParams, searchParams);
  const handleBackToCategories = createBackToCategoriesHandler(setSearchParams, searchParams);
  const handleSkillAdded = createSkillAddedHandler();
  const handleSkillsOnboardingComplete = createSkillsOnboardingCompleteHandler();

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
        onSkillsOnboardingComplete={handleSkillsOnboardingComplete}
      >
        <div 
          className="backdrop-blur-sm rounded-lg p-6 shadow-lg border relative"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: moduleThemeColors.skills.primary + '40',
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px ${moduleThemeColors.skills.primary}10`
          }}
        >
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
    </SkillsProvider>
  );
}

export default SkillsPage;