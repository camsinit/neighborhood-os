import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skill, SkillCategory } from './types/skillTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@supabase/auth-helpers-react';
interface SkillsListProps {
  selectedCategory: SkillCategory | null;
  showUserRequestsOnly?: boolean;
}

// Component to display the list of skills
const SkillsList = ({
  selectedCategory,
  showUserRequestsOnly = false
}: SkillsListProps) => {
  const user = useUser();

  // Query to fetch skills data
  const {
    data: skills,
    isLoading
  } = useQuery({
    queryKey: ['skills-exchange', selectedCategory, showUserRequestsOnly],
    queryFn: async () => {
      let query = supabase.from('skills_exchange').select('*').order('created_at', {
        ascending: false
      });
      if (selectedCategory) {
        query = query.eq('skill_category', selectedCategory);
      }

      // If showing user requests, filter by user_id and request_type
      if (showUserRequestsOnly && user) {
        query = query.eq('user_id', user.id).eq('request_type', 'need');
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return data as Skill[];
    }
  });
  if (isLoading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
    </div>;
  }

  // If showing user requests only, don't split into needs/offers
  if (showUserRequestsOnly) {
    return <div className="space-y-4">
        
        {skills?.map(skill => <div key={skill.id} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer">
            <h4 className="font-medium text-gray-900">{skill.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {skill.skill_category}
              </span>
            </div>
          </div>)}
        {skills?.length === 0 && <p className="text-gray-500 text-center py-8">
            You haven't made any skill requests yet.
          </p>}
      </div>;
  }

  // Separate skills into needs and offers for the regular view
  const needs = skills?.filter(skill => skill.request_type === 'need') || [];
  const offers = skills?.filter(skill => skill.request_type === 'offer') || [];
  return <div className="space-y-6">
      {/* Offers Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Skills Offered</h3>
        {offers.map(skill => <div key={skill.id} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer">
            <h4 className="font-medium text-gray-900">{skill.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {skill.skill_category}
              </span>
            </div>
          </div>)}
      </div>

      {/* Needs Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Skills Needed</h3>
        {needs.map(skill => <div key={skill.id} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer">
            <h4 className="font-medium text-gray-900">{skill.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {skill.skill_category}
              </span>
            </div>
          </div>)}
      </div>
    </div>;
};
export default SkillsList;