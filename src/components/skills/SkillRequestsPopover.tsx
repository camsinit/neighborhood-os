
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Bell, MessageSquarePlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { SkillWithProfile } from './types/skillTypes';
import { useState } from 'react';
import SkillContributionDialog from './SkillContributionDialog';

/**
 * SkillRequestsPopover Component
 * 
 * This component displays a notification-style popover for skill requests.
 * It shows a button with an icon that, when clicked, displays a list of
 * recent skill requests that users can contribute to.
 */
const SkillRequestsPopover = () => {
  // State to track which skill request to show contribution dialog for
  const [selectedSkill, setSelectedSkill] = useState<{
    id: string;
    title: string;
    requesterId: string;
  } | null>(null);
  
  // Query to fetch skill requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['skill-requests'],
    queryFn: async () => {
      // Fetch skill requests (needs with type = 'need')
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
        .limit(5); // Only show the 5 most recent requests
        
      if (error) throw error;
      return data as SkillWithProfile[];
    }
  });

  // Handler for when a request is clicked
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
              // Loading state
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
              // List of skill requests
              <>
                {requests.map(request => (
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
                      <p className="text-xs text-gray-500 truncate">
                        From: {request.profiles?.display_name || 'Anonymous'}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // Empty state
              <div className="py-8 px-4 text-center text-gray-500">
                <p>No skill requests available</p>
                <p className="text-xs mt-1">Check back later for new requests</p>
              </div>
            )}
          </div>
          
          <div className="p-2 border-t">
            <Button 
              variant="link" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => window.location.href = '/skills'}
            >
              View all skill requests
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Contribution dialog */}
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
