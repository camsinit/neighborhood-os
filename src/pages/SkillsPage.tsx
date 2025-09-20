
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  createTabChangeHandler,
  createCategoryClickHandler,
  createBackToCategoriesHandler,
  getTypedCategory,
  createSkillAddedHandler
} from '@/utils/skillsPageHandlers';
import ModuleLayout from '@/components/layout/ModuleLayout';
import SkillsPageContent from '@/components/skills/SkillsPageContent';
import { Sheet } from '@/components/ui/sheet';
import SkillSheetContent from '@/components/skills/SkillSheetContent';
import SkillRequestSheet from '@/components/skills/SkillRequestSheet';
import SkillOfferSheet from '@/components/skills/SkillOfferSheet';
import { SkillsProvider } from '@/contexts/SkillsContext';
import { moduleThemeColors } from '@/theme/moduleTheme';
import { useSkillsOnboarding } from '@/hooks/useSkillsOnboarding';
import { usePageSheetController } from '@/hooks/usePageSheetController';
import { fetchSkillByTitle } from '@/services/skills/skillFetcher';

/**
 * SkillsPage - Main page component for the Skills Exchange
 * 
 * Now uses unified sheet system for URL-based navigation and deep linking.
 * Simplified state management using usePageSheetController like NeighborsPage.
 */
function SkillsPage() {
  // Get skills onboarding state and refresh function
  const {
    hasCompletedSkillsOnboarding,
    isLoading: isOnboardingLoading,
    error: onboardingError,
    refreshOnboardingStatus
  } = useSkillsOnboarding();

  // URL search parameters for view, category, and search
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get current view from URL params (offers, requests, mine)
  const view = searchParams.get('view') || 'offers';
  // Get selected category from URL params
  const category = searchParams.get('category');
  // Get search query from URL params
  const searchQuery = searchParams.get('search') || '';
  
  // Local state for skill offer sheet
  const [isSkillOfferSheetOpen, setIsSkillOfferSheetOpen] = useState(false);
  // Local state for skill request sheet
  const [isSkillRequestSheetOpen, setIsSkillRequestSheetOpen] = useState(false);

  // Universal page controller for skill sheet management
  const {
    isSheetOpen,
    sheetItem,
    openSheet,
    closeSheet
  } = usePageSheetController({
    contentType: 'skills',
    fetchItem: fetchSkillByTitle,
    pageName: 'SkillsPage'
  });

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
            handleTabChange={handleTabChange}
            handleCategoryClick={handleCategoryClick}
            handleBackToCategories={handleBackToCategories}
            getTypedCategory={getTypedCategory}
            setSearchParams={setSearchParams}
            setIsSkillOfferSheetOpen={setIsSkillOfferSheetOpen}
            setIsSkillRequestSheetOpen={setIsSkillRequestSheetOpen}
          />
        </div>
      </ModuleLayout>
      
      {/* Sheet for offering skills - form-based experience */}
      <SkillOfferSheet 
        open={isSkillOfferSheetOpen}
        onOpenChange={setIsSkillOfferSheetOpen}
        onSkillAdded={handleSkillAdded}
      />

      {/* Skill Request Sheet - For requesting help from neighbors */}
      <SkillRequestSheet 
        open={isSkillRequestSheetOpen}
        onOpenChange={setIsSkillRequestSheetOpen}
      />

      {/* Universal sheet for skill details */}
      {isSheetOpen && sheetItem && (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
          <SkillSheetContent 
            skillTitle={sheetItem.title}
            skillCategory={sheetItem.category}
            onOpenChange={closeSheet}
          />
        </Sheet>
      )}
    </SkillsProvider>
  );
}

export default SkillsPage;
