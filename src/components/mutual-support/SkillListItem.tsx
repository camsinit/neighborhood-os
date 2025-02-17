
import { Circle, Plus, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useState } from "react";
import { SupportItem } from "./types";
import RequestScheduleDialog from "./RequestScheduleDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

interface SkillListItemProps {
  item: SupportItem;
  onClick: () => void;
}

const SkillListItem = ({ item, onClick }: SkillListItemProps) => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const { toast } = useToast();
  const user = useUser();
  const displayName = item.profiles?.display_name || item.originalRequest.profiles.display_name;
  
  // Fetch contributors for this skill
  const { data: contributors } = useQuery({
    queryKey: ['skill-contributors', item.originalRequest.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skill_contributors')
        .select(`
          *,
          profiles (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('skill_id', item.originalRequest.id)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
  });

  // Check if current user is a contributor
  const isContributor = contributors?.some(c => c.user_id === user?.id);

  const handleScheduleConfirm = async (schedule: { days: string[]; timePreference: string[] }) => {
    if (!user) return;

    try {
      // Create notifications for all contributors
      const notifications = contributors?.map(contributor => ({
        action_label: 'Review Request',
        action_type: 'help' as const,
        actor_id: user.id,
        content_id: item.originalRequest.id,
        content_type: 'skill_request',
        notification_type: 'skills' as const,
        title: `New request for ${item.title}`,
        user_id: contributor.user_id,
        metadata: {
          schedule,
          skill_title: item.title
        }
      }));

      if (notifications?.length) {
        const { error } = await supabase
          .from('notifications')
          .insert(notifications);

        if (error) throw error;
      }

      toast({
        title: "Request sent",
        description: `Your request has been sent to ${contributors?.length || 0} neighbors who can help!`,
      });
    } catch (error) {
      console.error('Error creating notifications:', error);
      toast({
        title: "Error sending request",
        description: "There was a problem sending your request. Please try again.",
        variant: "destructive"
      });
    }

    onClick();
  };

  const handleOfferSkill = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to offer your skills.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('skill_contributors')
        .upsert({
          skill_id: item.originalRequest.id,
          user_id: user.id,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Skill offered",
        description: "Others can now see that you can help with this skill!",
      });
    } catch (error) {
      console.error('Error offering skill:', error);
      toast({
        title: "Error offering skill",
        description: "There was a problem offering your skill. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleSkillStatus = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('skill_contributors')
        .update({ is_active: !isContributor })
        .eq('skill_id', item.originalRequest.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: isContributor ? "Skill paused" : "Skill reactivated",
        description: isContributor 
          ? "You won't receive new skill requests until you reactivate" 
          : "You'll now receive new skill requests",
      });
    } catch (error) {
      console.error('Error toggling skill status:', error);
      toast({
        title: "Error updating skill",
        description: "There was a problem updating your skill status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Show first 3 contributors and count of additional ones
  const visibleContributors = contributors?.slice(0, 3) || [];
  const additionalCount = (contributors?.length || 0) - 3;

  return (
    <>
      <div className="flex items-start gap-4 py-3 px-6 group hover:bg-gray-50 rounded-lg transition-colors">
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarFallback>
            {displayName?.[0] || <Circle className="h-4 w-4 text-gray-400" />}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
              
              {contributors && contributors.length > 0 && (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex -space-x-2 mt-2 cursor-pointer">
                      {visibleContributors.map((contributor) => (
                        <Avatar key={contributor.user_id} className="border-2 border-white">
                          <AvatarImage src={contributor.profiles.avatar_url || undefined} />
                          <AvatarFallback>
                            {contributor.profiles.display_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {additionalCount > 0 && (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 border-2 border-white text-sm font-medium text-gray-600">
                          +{additionalCount}
                        </div>
                      )}
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Neighbors offering this skill</h4>
                      <div className="space-y-1">
                        {contributors.map((contributor) => (
                          <div key={contributor.user_id} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={contributor.profiles.avatar_url || undefined} />
                              <AvatarFallback>{contributor.profiles.display_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{contributor.profiles.display_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isContributor ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleSkillStatus}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOfferSkill}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Offer Skill
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsScheduleOpen(true)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Request
              </Button>
            </div>
          </div>
        </div>
      </div>

      <RequestScheduleDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        onConfirm={handleScheduleConfirm}
        displayName={displayName || ""}
      />
    </>
  );
};

export default SkillListItem;
