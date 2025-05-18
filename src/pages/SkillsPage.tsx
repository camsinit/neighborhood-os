
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUser } from '@supabase/auth-helpers-react';
import SkillForm from '@/components/skills/SkillForm';

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
  const [dialogMode, setDialogMode] = useState<'offer' | 'request'>('offer');
  
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
  const handleOpenSkillDialog = (mode: 'offer' | 'request') => {
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
  
  // Handle dialog submission
  const handleSkillAdded = () => {
    setIsSkillDialogOpen(false);
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
    >
      <div className="flex flex-col space-y-4">
        {/* Entire page uses a single Tabs component for navigation */}
        <Tabs value={view} onValueChange={handleTabChange} className="w-full">
          {/* Reorganized top section with all controls in a single row */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
              {/* Search input */}
              <SearchInput 
                placeholder="Search skills..."
                onChange={(e) => handleSearchChange(e.target.value)}
                value={searchQuery}
                ref={searchInputRef}
                className="w-full sm:w-[200px]"
              />
              
              {/* Category filter - moved here from below */}
              <SkillsFilter 
                selectedCategory={getTypedCategory(category) || null}
                onCategoryChange={handleCategoryChange}
              />
              
              {/* TabsList is now properly inside the Tabs component */}
              <TabsList className="ml-0 sm:ml-2">
                <TabsTrigger value="offers">Offers</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="mine">My Skills</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Add Skill button on the RIGHT of tabs */}
            <Button 
              className="whitespace-nowrap flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleOpenSkillDialog('offer')}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Skill</span>
            </Button>
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
      </div>

      {/* Skill dialog */}
      {isSkillDialogOpen && (
        <Dialog open={isSkillDialogOpen} onOpenChange={handleCloseSkillDialog}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'offer' ? 'Offer a Skill' : 'Request a Skill'}
              </DialogTitle>
            </DialogHeader>
            <SkillForm 
              mode={dialogMode}
              onSuccess={handleSkillAdded}
              onCancel={handleCloseSkillDialog}
            />
          </DialogContent>
        </Dialog>
      )}
    </ModuleLayout>
  );
}

export default SkillsPage;
