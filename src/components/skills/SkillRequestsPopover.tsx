
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
import SkillRequestNotificationItem from './notifications/SkillRequestNotificationItem';
import EmptySkillRequestState from './notifications/EmptySkillRequestState';
import SkillRequestsDrawer from './notifications/SkillRequestsDrawer';

// Extracted notification loading state component
const NotificationLoadingState = () => (
  <div className="p-4 space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

// Extracted notifications list component
const NotificationsList = ({ 
  requests, 
  handleRequestClick 
}: { 
  requests: SkillWithProfile[], 
  handleRequestClick: (request: SkillWithProfile) => void 
}) => (
  <>
    {requests.map(request => (
      <SkillRequestNotificationItem
        key={request.id}
        request={request}
        onClick={() => handleRequestClick(request)}
      />
    ))}
  </>
);

const SkillRequestsPopover = () => {
  // State for selected skill and drawer visibility
  const [selectedSkill, setSelectedSkill] = useState<{
    id: string;
    title: string;
    requesterId: string;
  } | null>(null);
  
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
    enabled: isDrawerOpen // Only fetch when drawer is opened
  });

  // Handler when a user clicks on a request item
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
            size="default"  // Changed from sm to default to match other buttons
            className="gap-2"  // Removed h-8 to use default button height
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
              <NotificationLoadingState />
            ) : requests && requests.length > 0 ? (
              <NotificationsList 
                requests={requests} 
                handleRequestClick={handleRequestClick} 
              />
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
        onRequestClick={handleRequestClick}
      />
      
      {/* Dialog for responding to a request */}
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
