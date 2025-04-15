
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { MessageSquarePlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { SkillWithProfile } from './types/skillTypes';
import SkillContributionDialog from './SkillContributionDialog';
import { formatDistanceToNow } from 'date-fns';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose
} from '@/components/ui/drawer';

const SkillRequestsPopover = () => {
  const [selectedSkill, setSelectedSkill] = useState<{
    id: string;
    title: string;
    requesterId: string;
  } | null>(null);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
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

  const handleRequestClick = (skill: SkillWithProfile) => {
    setSelectedSkill({
      id: skill.id,
      title: skill.title,
      requesterId: skill.user_id
    });
  };

  const renderRequestItem = (request: SkillWithProfile) => (
    <div 
      key={request.id}
      className="p-3 border-b hover:bg-gray-50 cursor-pointer flex items-center gap-3"
      onClick={() => handleRequestClick(request)}
    >
      <Avatar className="h-9 w-9">
        <AvatarImage src={request.profiles?.avatar_url || undefined} />
        <AvatarFallback>{request.profiles?.display_name?.[0] || '?'}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{request.title}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500 truncate">
            {request.profiles?.display_name || 'Anonymous'}
          </p>
          <span className="text-xs text-gray-400">•</span>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );

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
            ) : requests && requests.length > 0 ? (
              <>
                {requests.map(request => renderRequestItem(request))}
              </>
            ) : (
              <div className="py-8 px-4 text-center text-gray-500">
                <p>No skill requests available</p>
                <p className="text-xs mt-1">Check back later for new requests</p>
              </div>
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
                  ) : allRequests && allRequests.length > 0 ? (
                    <div className="divide-y">
                      {allRequests.map(request => renderRequestItem(request))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <p>No skill requests available</p>
                      <p className="text-xs mt-1">Be the first to request a skill</p>
                    </div>
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
