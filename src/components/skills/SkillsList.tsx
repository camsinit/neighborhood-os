
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skill, SkillCategory } from './types/skillTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpRight } from 'lucide-react';
import SkillContributionDialog from './SkillContributionDialog';

interface SkillsListProps {
  selectedCategory: SkillCategory | null;
}

const SkillsList = ({
  selectedCategory
}: SkillsListProps) => {
  const user = useUser();
  const [selectedSkill, setSelectedSkill] = useState<{
    id: string;
    title: string;
    requesterId: string;
  } | null>(null);

  const {
    data: skills,
    isLoading
  } = useQuery({
    queryKey: ['skills-exchange', selectedCategory],
    queryFn: async () => {
      let query = supabase.from('skills_exchange').select(`
        *,
        profiles:user_id (
          avatar_url,
          display_name
        )
      `).order('created_at', { ascending: false });
      
      if (selectedCategory) {
        query = query.eq('skill_category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Skill & { profiles: { avatar_url: string | null; display_name: string | null } })[];
    }
  });

  if (isLoading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
    </div>;
  }

  const requests = skills?.filter(skill => skill.request_type === 'need') || [];
  const offers = skills?.filter(skill => skill.request_type === 'offer') || [];

  return (
    <div className="space-y-8">
      {requests.length > 0 && (
        <div>
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-2 px-2">
            {requests.map(request => (
              <div 
                key={request.id}
                className="relative flex-shrink-0 w-[250px] h-[150px] border border-dashed border-gray-300 rounded-lg p-4 bg-white cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => {/* Handle click to show details */}}
              >
                <ArrowUpRight className="absolute top-2 right-2 h-4 w-4 text-gray-400" />
                <div className="h-full flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.profiles?.avatar_url || undefined} />
                      <AvatarFallback>{request.profiles?.display_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <h4 className="font-medium text-gray-900 line-clamp-2">{request.title}</h4>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSkill({
                        id: request.id,
                        title: request.title,
                        requesterId: request.user_id
                      });
                    }}
                  >
                    Contribute Skill
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {offers.map(skill => (
          <div 
            key={skill.id} 
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={skill.profiles?.avatar_url || undefined} />
                <AvatarFallback>{skill.profiles?.display_name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-gray-900">{skill.title}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{skill.description}</p>
              </div>
            </div>
            <Button variant="outline">Request Skill</Button>
          </div>
        ))}
      </div>

      {selectedSkill && (
        <SkillContributionDialog
          open={!!selectedSkill}
          onOpenChange={(open) => !open && setSelectedSkill(null)}
          skillRequestId={selectedSkill.id}
          requestTitle={selectedSkill.title}
          requesterId={selectedSkill.requesterId}
        />
      )}
    </div>
  );
};

export default SkillsList;
