
import React, { useState } from 'react';
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
import SkillsPageSelector from '@/components/skills/SkillsPageSelector';
import SkillRequestSheet from '@/components/skills/SkillRequestSheet'; // NEW: Import skill request sheet
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SkillsProvider } from '@/contexts/SkillsContext';
import { moduleThemeColors } from '@/theme/moduleTheme';
import { useSkillsOnboarding } from '@/hooks/useSkillsOnboarding';

/**
 * SkillsPage - Main page component for the Skills Exchange
 * 
 * This component implements a "contribute to view" approach where users must complete
 * skills onboarding before viewing neighborhood skills. Shows a blur overlay with
 * onboarding dialog until the user shares their own skills.
 * 
 * Now uses Sheet for adding skills (consistent with other pages).
 */
function SkillsPage() {
  // Get skills onboarding state and refresh function
  const {
    hasCompletedSkillsOnboarding,
    isLoading: isOnboardingLoading,
    error: onboardingError,
    refreshOnboardingStatus
  } = useSkillsOnboarding();

  // Get all state and derived values from custom hook
  const {
    view,
    category,
    searchQuery,
    searchParams,
    setSearchParams,
    isSkillDialogOpen,
    setIsSkillDialogOpen,
    isSkillRequestSheetOpen,        // NEW: Include skill request sheet state
    setIsSkillRequestSheetOpen,     // NEW: Include skill request sheet setter
    searchInputRef
  } = useSkillsPageState();

  // Create handler functions using the utility factory functions
  const handleTabChange = createTabChangeHandler(setSearchParams, searchParams);
  const handleCategoryClick = createCategoryClickHandler(setSearchParams, searchParams);
  const handleBackToCategories = createBackToCategoriesHandler(setSearchParams, searchParams);
  const handleSkillAdded = createSkillAddedHandler();
  
  // Create skills onboarding complete handler that refreshes the status
  const handleSkillsOnboardingComplete = async () => {
    // Refresh the onboarding status to ensure we have the latest state
    await refreshOnboardingStatus();
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
            setIsSkillRequestSheetOpen={setIsSkillRequestSheetOpen} // NEW: Pass skill request sheet handler
          />
        </div>
      </ModuleLayout>
      
      {/* Sheet for adding skills - consistent with other pages */}
      <Sheet open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
        <SheetContent 
          side="right" 
          className="w-[400px] sm:w-[540px] overflow-y-auto"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: moduleThemeColors.skills.primary + '40',
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px ${moduleThemeColors.skills.primary}10`
          }}
        >
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold">
              Add Skills to Share
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <SkillsPageSelector 
              selectedCategory={getTypedCategory(category)} 
              onSkillAdded={handleSkillAdded} 
              multiCategoryMode={!category}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* NEW: Sheet for requesting skills */}
      <SkillRequestSheet 
        open={isSkillRequestSheetOpen} 
        onOpenChange={setIsSkillRequestSheetOpen} 
      />
    </SkillsProvider>
  );
}

export default SkillsPage;
