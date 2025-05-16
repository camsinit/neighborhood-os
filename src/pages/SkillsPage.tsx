import React, { useEffect, useState } from 'react';
import { ModuleLayout } from '@/components/layout';
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
import { Dialog } from '@/components/ui/dialog';
import { useUser } from '@supabase/auth-helpers-react';

// Create a logger for this component
const logger = createLogger('SkillsPage');

function SkillsPage() {
  // Get search parameters from URL
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'offers';
  const category = searchParams.get('category') || null;
  const searchQuery = searchParams.get('q') || '';
  const action = searchParams.get('action');
  
  // Local state to manage dialog
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(action === 'create');
  const [dialogMode, setDialogMode] = useState<'offer' | 'need'>('offer');
  
  const user = useUser();
  
  // Use the highlight system to highlight skills when requested
  const highlightedSkill = useHighlightedItem('skill');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  const { searchQuery: storeSearchQuery, setSearchQuery } = useSkillsStore();
  
  // Set up search from URL params
  useEffect(() => {
    setSearchQuery(searchQuery);
  }, [searchQuery, setSearchQuery]);
  
  // Handle direct links to specific skills
  useEffect(() => {
    const skillId = searchParams.get('skillId');
    if (skillId) {
      highlightItem('skill', skillId);
    }
  }, [searchParams]);
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', value);
    setSearchParams(newParams);
  };
  
  // Handle category changes
  const handleCategoryChange = (newCategory: SkillCategory | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (newCategory) {
      newParams.set('category', newCategory);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };
  
  // Handle search changes
  const handleSearchChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('q', value);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };
  
  // Open skill dialog with specified mode
  const handleOpenSkillDialog = (mode: 'offer' | 'need') => {
    setDialogMode(mode);
    setIsSkillDialogOpen(true);
    
    // Update URL to reflect the action
    const newParams = new URLSearchParams(searchParams);
    newParams.set('action', 'create');
    setSearchParams(newParams);
  };
  
  // Close skill dialog and update URL
  const handleCloseSkillDialog = () => {
    setIsSkillDialogOpen(false);
    
    // Remove the action parameter from URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('action');
    setSearchParams(newParams);
  };
  
  // Convert string category to SkillCategory type or undefined
  const getTypedCategory = (categoryString: string | null): SkillCategory | undefined => {
    if (!categoryString) return undefined;
    return categoryString as SkillCategory;
  };
  
  return (
    <ModuleLayout 
      title="Skills Exchange"
      description="Share skills and knowledge with your neighbors"
      themeColor="skills"
      actions={
        <Button 
          className="whitespace-nowrap flex items-center gap-1.5"
          onClick={() => handleOpenSkillDialog('offer')}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Skill</span>
        </Button>
      }
    >
      <Tabs value={view} onValueChange={handleTabChange}>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
          <TabsList>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="mine">My Skills</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <SearchInput 
              placeholder="Search skills..."
              onChange={(e) => handleSearchChange(e.target.value)}
              value={searchQuery}
              ref={searchInputRef}
            />
          </div>
        </div>
        
        {/* Category filter section */}
        <div className="mb-4">
          <SkillsFilter 
            selectedCategory={getTypedCategory(category) || null}
            onCategoryChange={handleCategoryChange}
          />
        </div>
        
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

      {/* Skill dialog would go here - placeholder for now */}
      {isSkillDialogOpen && (
        <Dialog open={isSkillDialogOpen} onOpenChange={handleCloseSkillDialog}>
          {/* Add your skill dialog content here */}
        </Dialog>
      )}
    </ModuleLayout>
  );
}

export default SkillsPage;
