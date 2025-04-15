
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { MessageSquarePlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { SkillWithProfile } from './types/skillTypes';
import SkillContributionDialog from './SkillContributionDialog';
import SkillCard from './list/SkillCard';
import EmptySkillRequestState from './notifications/EmptySkillRequestState';
import SkillRequestsDrawer from './notifications/SkillRequestsDrawer';

// Loading state component shows card-like skeletons
const NotificationLoadingState = () => (
  <div className="space-y-4 p-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// List component using SkillCard
const NotificationsList = ({ 
  requests 
}: { 
  requests: SkillWithProfile[]
}) => (
  <div className="space-y-4 p-4">
    {requests.map(request => (
      <SkillCard
        key={request.id}
        skill={request}
        type="request"
      />
    ))}
  </div>
);

const SkillRequestsPopover = () => {
  // State for selected skill and drawer visibility
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Query for recent skill requests (limited to 5)
  const { data: requests, isLoading } = useQuery({
    queryKey: ['skill-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills_exchange')
        .select(`
          *,
          profiles:user_id (
            avatar_url,
            display_name
          )
        `)
        .eq('request_type', 'need')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data as SkillWithProfile[];
    }
  });

  // Query for all skill requests (for drawer view)
  const { data: allRequests, isLoading: isLoadingAll } = useQuery({
    queryKey: ['all-skill-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills_exchange')
        .select(`
          *,
          profiles:user_id (
            avatar_url,
            display_name
          )
        `)
        .eq('request_type', 'need')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as SkillWithProfile[];
    },
    enabled: isDrawerOpen
  });

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="default"
            className="gap-2"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>Skill Requests</span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[350px] p-0" align="end">
          <div className="p-2 font-medium text-sm border-b">
            Recent Skill Requests
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <NotificationLoadingState />
            ) : requests && requests.length > 0 ? (
              <NotificationsList requests={requests} />
            ) : (
              <EmptySkillRequestState />
            )}
          </div>
          
          <div className="p-2 border-t">
            <Button 
              variant="link" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => setIsDrawerOpen(true)}
            >
              View all skill requests
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Drawer for showing all skill requests */}
      <SkillRequestsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        requests={allRequests}
        isLoading={isLoadingAll}
      />
    </>
  );
};

export default SkillRequestsPopover;
