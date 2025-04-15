
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { useSkillRequests } from './hooks/useSkillRequests';
import { RequestLoadingSkeleton, RequestEmptyState } from './requests/RequestStates';
import RequestItem from './requests/RequestItem';
import SkillContributionDialog from './SkillContributionDialog';
import { SkillWithProfile } from './types/skillTypes';

const SkillRequestsPopover = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<{
    id: string;
    title: string;
    requesterId: string;
  } | null>(null);

  const { requests, allRequests, isLoading, isLoadingAll } = useSkillRequests(isDrawerOpen);

  const handleRequestClick = (skill: SkillWithProfile) => {
    setSelectedSkill({
      id: skill.id,
      title: skill.title,
      requesterId: skill.user_id
    });
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-8"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>Skill Requests</span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-2 font-medium text-sm border-b">
            Recent Skill Requests
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <RequestLoadingSkeleton />
            ) : requests && requests.length > 0 ? (
              requests.map(request => (
                <RequestItem 
                  key={request.id}
                  request={request}
                  onClick={handleRequestClick}
                />
              ))
            ) : (
              <RequestEmptyState />
            )}
          </div>
          
          <div className="p-2 border-t">
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="w-full text-xs"
                >
                  View all skill requests
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[40vh]">
                <DrawerHeader>
                  <DrawerTitle>All Skill Requests</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 py-2 overflow-y-auto max-h-[60vh]">
                  {isLoadingAll ? (
                    <RequestLoadingSkeleton />
                  ) : allRequests && allRequests.length > 0 ? (
                    <div className="divide-y">
                      {allRequests.map(request => (
                        <RequestItem 
                          key={request.id}
                          request={request}
                          onClick={handleRequestClick}
                        />
                      ))}
                    </div>
                  ) : (
                    <RequestEmptyState />
                  )}
                </div>
                <div className="p-4 border-t text-center">
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </PopoverContent>
      </Popover>
      
      {selectedSkill && (
        <SkillContributionDialog
          open={!!selectedSkill}
          onOpenChange={(open) => !open && setSelectedSkill(null)}
          skillRequestId={selectedSkill.id}
          requestTitle={selectedSkill.title}
          requesterId={selectedSkill.requesterId}
        />
      )}
    </>
  );
};

export default SkillRequestsPopover;
