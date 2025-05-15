import React, { useEffect } from 'react';
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

const logger = createLogger('SkillsPage');

function SkillsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'offers';
  const category = searchParams.get('category') || null;
  const searchQuery = searchParams.get('q') || '';
  
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
      // Fixed highlightItem call
      highlightItem('skills', skillId);
    }
  }, [searchParams]);
  
  // Log component mounting
  useEffect(() => {
    logger.info('Component mounted, version: 2025-04-28');
  }, []);
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', value);
    setSearchParams(newParams);
  };
  
  return (
    
    <ModuleContainer>
      <ModuleHeader 
        title="Skills Exchange"
        description="Share skills and knowledge with your neighbors"
        actions={
          <Button className="whitespace-nowrap flex items-center gap-1.5">
            <PlusCircle className="h-4 w-4" />
            <span>Add Skill</span>
          </Button>
        }
      />
      <ModuleContent>
        <Tabs value={view} onValueChange={handleTabChange}>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
            <TabsList>
              <TabsTrigger value="offers">Offers</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="mine">My Skills</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <SkillsFilter />
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
            </div>
          </div>
          
          <TabsContent value="offers" className="mt-0">
            <SkillsList showRequests={false} />
          </TabsContent>
          <TabsContent value="requests" className="mt-0">
            <SkillsList showRequests={true} />
          </TabsContent>
          <TabsContent value="mine" className="mt-0">
            <SkillsList showMine={true} />
          </TabsContent>
        </Tabs>
      </ModuleContent>
    </ModuleContainer>
  );
}

export default SkillsPage;
