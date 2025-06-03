
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import SkillsList from '@/components/skills/SkillsList';
import SkillsFilter from '@/components/skills/SkillsFilter';
import SearchInput from '@/components/ui/search-input';
import SkillCategoryGrid from '@/components/skills/SkillCategoryGrid';
import SkillCategoryView from '@/components/skills/SkillCategoryView';
import SkillsPageNavigation from '@/components/skills/SkillsPageNavigation';
import CategorySkillsDialog from '@/components/skills/CategorySkillsDialog';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * SkillsPageContent - Main content area for the Skills page
 * 
 * This component handles the different views (category grid, category view, search results, tabs)
 * and manages the logic for switching between them based on URL state.
 */
interface SkillsPageContentProps {
  view: string;
  category: string | null;
  searchQuery: string;
  searchParams: URLSearchParams;
  searchInputRef: React.RefObject<HTMLInputElement>;
  handleTabChange: (value: string) => void;
  handleCategoryClick: (selectedCategory: SkillCategory) => void;
  handleBackToCategories: () => void;
  getTypedCategory: (categoryString: string | null) => SkillCategory | undefined;
  setSearchParams: (params: URLSearchParams) => void;
  setIsSkillDialogOpen: (open: boolean) => void;
}

const SkillsPageContent: React.FC<SkillsPageContentProps> = ({
  view,
  category,
  searchQuery,
  searchParams,
  searchInputRef,
  handleTabChange,
  handleCategoryClick,
  handleBackToCategories,
  getTypedCategory,
  setSearchParams,
  setIsSkillDialogOpen
}) => {
  // State for the category skills dialog
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);

  // Handle category click - check if empty and show appropriate action
  const handleCategoryClickWithEmptyCheck = async (selectedCategory: SkillCategory) => {
    // We'll need to check if the category has skills
    // For now, let's assume we'll handle this by checking in the click handler
    // If empty, show the dialog, otherwise navigate to category view
    
    // TODO: Add logic to check if category is empty
    // For now, we'll just navigate to the category view
    handleCategoryClick(selectedCategory);
  };

  // Handle skills selection from the category dialog
  const handleSkillsSelected = async (skills: string[]) => {
    // TODO: Add logic to save the selected skills
    // This would typically involve calling a mutation to save the skills
    console.log('Selected skills:', skills, 'for category:', selectedCategory);
    
    // After saving, navigate to the category view
    if (selectedCategory) {
      handleCategoryClick(selectedCategory);
    }
  };

  // Helper function to format category name for display
  const getCategoryDisplayName = (categoryName: SkillCategory) => {
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  };

  // Determine which view to show based on URL state
  const showCategoryGrid = !category && !searchQuery && view === 'offers';
  const showCategoryView = category && !searchQuery;
  const showSearchResults = searchQuery;
  const showRegularTabs = !showCategoryGrid && !showCategoryView && !showSearchResults;

  return (
    <>
      {/* Show category grid as default view for offers tab */}
      {showCategoryGrid && (
        <div className="space-y-6">
          <SkillsPageNavigation
            view={view}
            searchQuery={searchQuery}
            searchParams={searchParams}
            searchInputRef={searchInputRef}
            handleTabChange={handleTabChange}
            setSearchParams={setSearchParams}
            setIsSkillDialogOpen={setIsSkillDialogOpen}
          />
          
          <SkillCategoryGrid onCategoryClick={handleCategoryClickWithEmptyCheck} />
        </div>
      )}
      
      {/* Show category view when a category is selected */}
      {showCategoryView && (
        <div className="space-y-6">
          {/* Header with back button, title, and add skill button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleBackToCategories}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Categories
              </Button>
              <h2 className="text-xl font-semibold text-gray-900">
                {getCategoryDisplayName(getTypedCategory(category)!)} Skills
              </h2>
            </div>
            
            <Button 
              className="whitespace-nowrap flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white shrink-0"
              onClick={() => setIsSkillDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Skill</span>
            </Button>
          </div>
          
          <SkillCategoryView 
            category={getTypedCategory(category)!} 
            onBack={handleBackToCategories}
          />
        </div>
      )}
      
      {/* Show search results when there's a search query */}
      {showSearchResults && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
            <div className="flex gap-2 flex-grow">
              <SearchInput 
                placeholder="Search skills..."
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.value) {
                    newParams.set('q', e.target.value);
                  } else {
                    newParams.delete('q');
                  }
                  setSearchParams(newParams);
                }}
                value={searchQuery}
                ref={searchInputRef}
              />
              <SkillsFilter />
              
              <Button 
                variant="outline"
                onClick={handleBackToCategories}
              >
                Clear Search
              </Button>
            </div>
            
            <Button 
              className="whitespace-nowrap flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white shrink-0"
              onClick={() => setIsSkillDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Skill</span>
            </Button>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Search Results for "{searchQuery}"
            </h2>
            <SkillsList showRequests={false} selectedCategory={getTypedCategory(category)} searchQuery={searchQuery} />
          </div>
        </div>
      )}
      
      {/* Show regular tabs view for requests and my skills */}
      {showRegularTabs && (
        <Tabs value={view} onValueChange={handleTabChange}>
          <SkillsPageNavigation
            view={view}
            searchQuery={searchQuery}
            searchParams={searchParams}
            searchInputRef={searchInputRef}
            handleTabChange={handleTabChange}
            setSearchParams={setSearchParams}
            setIsSkillDialogOpen={setIsSkillDialogOpen}
          />
          
          <TabsContent value="offers" className="mt-0">
            <SkillsList showRequests={false} selectedCategory={getTypedCategory(category)} searchQuery={searchQuery} />
          </TabsContent>
          <TabsContent value="requests" className="mt-0">
            <SkillsList showRequests={true} selectedCategory={getTypedCategory(category)} searchQuery={searchQuery} />
          </TabsContent>
          <TabsContent value="mine" className="mt-0">
            <SkillsList showMine={true} selectedCategory={getTypedCategory(category)} searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      )}
      
      {/* Category Skills Selection Dialog */}
      <CategorySkillsDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        category={selectedCategory || 'technology'}
        onSkillsSelected={handleSkillsSelected}
      />
    </>
  );
};

export default SkillsPageContent;
