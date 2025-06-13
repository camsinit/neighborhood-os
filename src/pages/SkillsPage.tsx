
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSkillsStore } from '@/stores/skillsStore';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { useDeepLinkHandler } from '@/hooks/useDeepLinkHandler';
import { createLogger } from '@/utils/logger';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import ModuleLayout from '@/components/layout/ModuleLayout';
import SkillsPageContent from '@/components/skills/SkillsPageContent';
import AddSkillPopover from '@/components/skills/AddSkillPopover';

const logger = createLogger('SkillsPage');

/**
 * SkillsPage - Main page component for the Skills Exchange
 * 
 * This component uses the standard ModuleLayout for consistency with other pages
 * and follows the universal page design pattern established across the application.
 * Updated to use proper ModuleLayout structure with consistent spacing and alignment.
 * Enhanced with unified navigation system and deep link handling.
 */
function SkillsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'offers';
  const category = searchParams.get('category') || null;
  const searchQuery = searchParams.get('q') || '';
  
  // State for the unified skill dialog
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  
  // Handle deep link parameters for direct navigation to skills
  const { hasDeepLink } = useDeepLinkHandler('skills');
  
  const highlightedSkill = useHighlightedItem('skills');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  const { setSearchQuery } = useSkillsStore();
  
  // Set up search from URL params
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
  
  return (
    <>
      <ModuleLayout
        title="Skill Sharing"
        description="Share skills and knowledge with your neighbors to build a stronger, more connected community."
        themeColor="skills"
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
      </ModuleLayout>
      
      {/* Unified Add Skill Popover */}
      <AddSkillPopover
        open={isSkillDialogOpen}
        onOpenChange={setIsSkillDialogOpen}
        selectedCategory={getTypedCategory(category)} // Auto-populate with current category if viewing one
        onSkillAdded={handleSkillAdded}
      />
    </>
  );
}

export default SkillsPage;
