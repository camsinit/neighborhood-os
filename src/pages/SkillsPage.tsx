
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSkillsStore } from '@/stores/skillsStore';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';
import { createLogger } from '@/utils/logger';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import AddSupportRequestDialog from '@/components/AddSupportRequestDialog';
import SkillsPageHeader from '@/components/skills/SkillsPageHeader';
import SkillsPageContent from '@/components/skills/SkillsPageContent';

const logger = createLogger('SkillsPage');

/**
 * SkillsPage - Main page component for the Skills Exchange
 * 
 * This component has been refactored to use smaller, focused components
 * for better maintainability. It manages the overall state and URL routing
 * while delegating rendering to specialized components.
 */
function SkillsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'offers';
  const category = searchParams.get('category') || null;
  const searchQuery = searchParams.get('q') || '';
  
  // Add state for the skill dialog
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  
  const highlightedSkill = useHighlightedItem('skills');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  const { setSearchQuery } = useSkillsStore();
  
  // Set up search from URL params
  useEffect(() => {
    setSearchQuery(searchQuery);
  }, [searchQuery, setSearchQuery]);
  
  // Handle direct links to specific skills
  useEffect(() => {
    const skillId = searchParams.get('skillId');
    if (skillId) {
      highlightItem('skills', skillId);
    }
  }, [searchParams]);
  
  // Log component mounting
  useEffect(() => {
    logger.info('Component mounted, version: 2025-06-03');
  }, []);
  
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
  
  return (
    <>
      <SkillsPageHeader>
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
      </SkillsPageHeader>
      
      {/* Add Skill Dialog */}
      <AddSupportRequestDialog
        open={isSkillDialogOpen}
        onOpenChange={setIsSkillDialogOpen}
        initialRequestType="offer"
        view="skills"
      />
    </>
  );
}

export default SkillsPage;
