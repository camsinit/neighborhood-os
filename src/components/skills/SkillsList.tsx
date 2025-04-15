
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skill, SkillCategory } from './types/skillTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@supabase/auth-helpers-react';
import SkillCard from './list/SkillCard';
import EmptyState from '@/components/ui/empty-state';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SkillsListProps {
  selectedCategory: SkillCategory | null;
  searchQuery?: string;
  showRequests?: boolean; // New prop to toggle between offers and requests view
}

const SkillsList = ({
  selectedCategory,
  searchQuery = '',
  showRequests = false
}: SkillsListProps) => {
  const user = useUser();
  
  const {
    data: skills,
    isLoading
  } = useQuery({
    queryKey: ['skills-exchange', selectedCategory, searchQuery, showRequests],
    queryFn: async () => {
      // Start with a base query
      let query = supabase.from('skills_exchange').select(`
        *,
        profiles:user_id (
          avatar_url,
          display_name
        )
      `).order('created_at', {
        ascending: false
      });

      // Add category filter if selected
      if (selectedCategory) {
        query = query.eq('skill_category', selectedCategory);
      }

      // Filter by request type
      query = query.eq('request_type', showRequests ? 'need' : 'offer');

      // Add search filter if provided
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
    </div>;
  }

  // Filter out deleted activities
  const filteredSkills = skills || [];

  // Show a special empty state for search with no results
  if (searchQuery && filteredSkills.length === 0) {
    return <EmptyState 
      icon={Sparkles} 
      title={`No results found for "${searchQuery}"`}
      description="Try a different search term or browse by category"
      actionLabel="Clear Search"
      onAction={() => window.location.href = '/skills'}
    />;
  }

  return (
    <div className="space-y-4">
      {filteredSkills.length > 0 ? (
        <div className="space-y-4">
          {filteredSkills.map(skill => (
            <SkillCard 
              key={skill.id} 
              skill={skill} 
              type={showRequests ? 'request' : 'offer'}
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Sparkles} 
          title={`No ${showRequests ? 'Skill Requests' : `${selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : ''} Skills`} Available`}
          description={`Be the first to ${showRequests ? 'request a skill' : `share your ${selectedCategory || ''} skills with the community`}`}
          actionLabel={`${showRequests ? 'Request a Skill' : `Share ${selectedCategory ? 'a ' + selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'a'} Skill`}`}
          onAction={() => window.location.href = '/skills?action=create'}
        />
      )}
    </div>
  );
};

export default SkillsList;
