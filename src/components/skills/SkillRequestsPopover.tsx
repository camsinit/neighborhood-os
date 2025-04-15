
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerClose,
  DrawerTrigger  // Added the missing DrawerTrigger import
} from '@/components/ui/drawer';
import { useSkillRequests } from './hooks/useSkillRequests';
import { RequestLoadingSkeleton, RequestEmptyState } from './requests/RequestStates';
import RequestItem from './requests/RequestItem';
import SkillContributionDialog from './SkillContributionDialog';
import { SkillWithProfile } from './types/skillTypes';

/**
 * SkillRequestsPopover Component
 * 
 * This component provides a UI for viewing skill requests in a popover and drawer format.
 * It shows recent requests in a compact popover view and allows viewing all requests in a drawer.
 */
const SkillRequestsPopover = () => {
  // State to control whether the drawer is open
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // State to track the currently selected skill for the contribution dialog
  const [selectedSkill, setSelectedSkill] = useState<{
    id: string;
    title: string;
    requesterId: string;
  } | null>(null);

  // Custom hook to fetch skill requests data
  const { requests, allRequests, isLoading, isLoadingAll } = useSkillRequests(isDrawerOpen);

  /**
   * Handles clicking on a skill request item
   * Opens the contribution dialog with the selected skill information
   */
  const handleRequestClick = (skill: SkillWithProfile) => {
    setSelectedSkill({
      id: skill.id,
      title: skill.title,
      requesterId: skill.user_id
    });
  };

  return (
    <>
      {/* Main popover component for skill requests */}
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
          {/* Header for the popover */}
          <div className="p-2 font-medium text-sm border-b">
            Recent Skill Requests
          </div>
          
          {/* Scrollable content area for the recent requests */}
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
          
          {/* Footer with button to view all requests */}
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
      
      {/* Contribution dialog that appears when a skill request is clicked */}
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
