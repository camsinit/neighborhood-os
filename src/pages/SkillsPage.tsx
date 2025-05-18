
import React from 'react';
import { ModuleLayout } from '@/components/layout';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import SkillsList from '@/components/skills/SkillsList';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { createLogger } from '@/utils/logger';
import { useUser } from '@supabase/auth-helpers-react';
import { useSkillsPageState } from '@/hooks/skills/useSkillsPageState';
import SkillsPageHeader from '@/components/skills/page/SkillsPageHeader';
import SkillsDialog from '@/components/skills/page/SkillsDialog';

// Create a logger for this component
const logger = createLogger('SkillsPage');

/**
 * SkillsPage - Main component for the Skills Exchange feature
 * 
 * This component has been refactored to use smaller, focused components
 * to improve maintainability and readability.
 */
function SkillsPage() {
  // Use our custom hook to manage page state and URL parameters
  const {
    view,
    category,
    searchQuery,
    isSkillDialogOpen,
    dialogMode,
    handleTabChange,
    handleCategoryChange,
    handleSearchChange,
    handleOpenSkillDialog,
    handleCloseSkillDialog,
    handleSkillAdded,
    getTypedCategory
  } = useSkillsPageState();
  
  const user = useUser();
  
  // Use the highlight system to highlight skills when requested
  const highlightedSkill = useHighlightedItem('skill');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <ModuleLayout 
      title="Skills Exchange"
      description="Share skills and knowledge with your neighbors"
      themeColor="skills"
    >
      <div className="flex flex-col space-y-4">
        {/* Entire page uses a single Tabs component for navigation */}
        <Tabs value={view} onValueChange={handleTabChange} className="w-full">
          {/* Header component with search, filter and tabs */}
          <SkillsPageHeader
            searchQuery={searchQuery}
            handleSearchChange={handleSearchChange}
            category={category}
            handleCategoryChange={handleCategoryChange}
            view={view}
            handleTabChange={handleTabChange}
            handleOpenSkillDialog={handleOpenSkillDialog}
          />
          
          {/* Tab content sections */}
          <TabsContent value="offers" className="mt-0">
            <SkillsList 
              showRequests={false} 
              selectedCategory={getTypedCategory(category)} 
              searchQuery={searchQuery} 
            />
          </TabsContent>
          <TabsContent value="requests" className="mt-0">
            <SkillsList 
              showRequests={true} 
              selectedCategory={getTypedCategory(category)} 
              searchQuery={searchQuery} 
            />
          </TabsContent>
          <TabsContent value="mine" className="mt-0">
            <SkillsList 
              showMine={true} 
              selectedCategory={getTypedCategory(category)} 
              searchQuery={searchQuery} 
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Skill dialog component */}
      {isSkillDialogOpen && (
        <SkillsDialog
          isOpen={isSkillDialogOpen}
          mode={dialogMode}
          onClose={handleCloseSkillDialog}
          onSuccess={handleSkillAdded}
        />
      )}
    </ModuleLayout>
  );
}

export default SkillsPage;
