
import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SkillWithProfile } from '../types/skillTypes';
import SkillRequestNotificationItem from './SkillRequestNotificationItem';
import EmptySkillRequestState from './EmptySkillRequestState';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from '@/components/ui/drawer';

/**
 * Full-screen drawer that shows all skill requests
 * 
 * This component loads when user clicks "View all skill requests"
 */
interface SkillRequestsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: SkillWithProfile[] | undefined;
  isLoading: boolean;
  onRequestClick?: (skill: SkillWithProfile) => void;
}

const SkillRequestsDrawer: React.FC<SkillRequestsDrawerProps> = ({
  open,
  onOpenChange,
  requests,
  isLoading,
  onRequestClick
}) => {
  // Helper to render loading skeletons
  const renderLoadingState = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-2 py-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>All Skill Requests</DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 py-2 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            renderLoadingState()
          ) : requests && requests.length > 0 ? (
            <div className="divide-y">
              {requests.map(request => (
                <SkillRequestNotificationItem 
                  key={request.id}
                  request={request} 
                  onClick={onRequestClick ? () => onRequestClick(request) : undefined} 
                />
              ))}
            </div>
          ) : (
            <EmptySkillRequestState 
              message="No skill requests available"
              subMessage="Be the first to request a skill"
            />
          )}
        </div>
        
        <div className="p-4 border-t text-center">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SkillRequestsDrawer;
