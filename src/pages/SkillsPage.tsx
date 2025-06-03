
import React, { useEffect, useState } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import SkillsList from '@/components/skills/SkillsList';
import SkillsFilter from '@/components/skills/SkillsFilter';
import SearchInput from '@/components/ui/search-input';
import { useSkillsStore } from '@/stores/skillsStore';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';
import { createLogger } from '@/utils/logger';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import AddSupportRequestDialog from '@/components/AddSupportRequestDialog';
import SkillCategoryGrid from '@/components/skills/SkillCategoryGrid';
import SkillCategoryView from '@/components/skills/SkillCategoryView';

const logger = createLogger('SkillsPage');

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
  
  // Determine which view to show based on URL state
  const showCategoryGrid = !category && !searchQuery && view === 'offers';
  const showCategoryView = category && !searchQuery;
  const showSearchResults = searchQuery;
  const showRegularTabs = !showCategoryGrid && !showCategoryView && !showSearchResults;
  
  return (
    <ModuleContainer themeColor="skills">
      {/* Header with improved spacing */}
      <ModuleHeader 
        title="Skills Exchange"
        themeColor="skills"
      />
      
      {/* Full-width description box with consistent padding - moved outside ModuleHeader */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-6 sm:px-[25px]">
        <div className="module-description bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm mx-0 px-[16px]">
          <p className="text-gray-700 text-sm">Share skills and knowledge with your neighbors</p>
        </div>
      </div>
      
      <ModuleContent className="px-4 sm:px-6 lg:px-8">
        <div className="module-card">
          {/* Show category grid as default view for offers tab */}
          {showCategoryGrid && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
                {/* Search and filter section on left */}
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
                  
                  {/* Tabs wrapped properly */}
                  <div className="ml-auto hidden sm:block">
                    <Tabs value={view} onValueChange={handleTabChange}>
                      <TabsList>
                        <TabsTrigger value="offers">Offers</TabsTrigger>
                        <TabsTrigger value="requests">Requests</TabsTrigger>
                        <TabsTrigger value="mine">My Skills</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                
                {/* Show tabs on mobile below search/filter */}
                <div className="sm:hidden w-full">
                  <Tabs value={view} onValueChange={handleTabChange}>
                    <TabsList className="w-full">
                      <TabsTrigger value="offers" className="flex-1">Offers</TabsTrigger>
                      <TabsTrigger value="requests" className="flex-1">Requests</TabsTrigger>
                      <TabsTrigger value="mine" className="flex-1">My Skills</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {/* Green Add Skills button with click handler */}
                <Button 
                  className="whitespace-nowrap flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white shrink-0"
                  onClick={() => setIsSkillDialogOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Skill</span>
                </Button>
              </div>
              
              <SkillCategoryGrid onCategoryClick={handleCategoryClick} />
            </div>
          )}
          
          {/* Show category view when a category is selected */}
          {showCategoryView && (
            <div className="space-y-6">
              <div className="flex justify-end">
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
              <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
                {/* Search and filter section on left */}
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
                  
                  {/* Tabs now hug the right side of the filter button */}
                  <div className="ml-auto hidden sm:block">
                    <TabsList>
                      <TabsTrigger value="offers">Offers</TabsTrigger>
                      <TabsTrigger value="requests">Requests</TabsTrigger>
                      <TabsTrigger value="mine">My Skills</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
                
                {/* Show tabs on mobile below search/filter */}
                <div className="sm:hidden w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="offers" className="flex-1">Offers</TabsTrigger>
                    <TabsTrigger value="requests" className="flex-1">Requests</TabsTrigger>
                    <TabsTrigger value="mine" className="flex-1">My Skills</TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Green Add Skills button with click handler */}
                <Button 
                  className="whitespace-nowrap flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white shrink-0"
                  onClick={() => setIsSkillDialogOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Skill</span>
                </Button>
              </div>
              
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
        </div>
      </ModuleContent>
      
      {/* Add Skill Dialog */}
      <AddSupportRequestDialog
        open={isSkillDialogOpen}
        onOpenChange={setIsSkillDialogOpen}
        initialRequestType="offer"
        view="skills"
      />
    </ModuleContainer>
  );
}

export default SkillsPage;
