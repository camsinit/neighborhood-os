
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skill, SkillCategory } from './types/skillTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SkillsListProps {
  selectedCategory: SkillCategory | null;
}

// Component to display the list of skills
const SkillsList = ({
  selectedCategory
}: SkillsListProps) => {
  const user = useUser();

  // Query to fetch skills data
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

  // Separate skills into requests and offers
  const requests = skills?.filter(skill => skill.request_type === 'need') || [];
  const offers = skills?.filter(skill => skill.request_type === 'offer') || [];

  return (
    <div className="space-y-8">
      {/* Skill Requests Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Skill Requests</h3>
        <div className="flex overflow-x-auto gap-4 pb-4">
          {requests.map(request => (
            <div 
              key={request.id}
              className="flex-shrink-0 w-[250px] h-[150px] border border-dashed border-gray-300 rounded-lg p-4 bg-white cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="h-full flex flex-col justify-between">
                <h4 className="font-medium text-gray-900 line-clamp-2">{request.title}</h4>
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => {/* Handle contribute skill */}}
                >
                  Contribute Skill
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Skills Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Available Skills</h3>
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
      </div>
    </div>
  );
};

export default SkillsList;
