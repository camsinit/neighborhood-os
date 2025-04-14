
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skill, SkillCategory } from './types/skillTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@supabase/auth-helpers-react';
import SkillContributionDialog from './SkillContributionDialog';
import SkillCard from './list/SkillCard';
import EmptyState from '@/components/ui/empty-state';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SkillsListProps {
  selectedCategory: SkillCategory | null;
  searchQuery?: string;
}

const SkillsList = ({
  selectedCategory,
  searchQuery = ''
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
    queryKey: ['skills-exchange', selectedCategory, searchQuery],
    queryFn: async () => {
      // Start with a base query
      let query = supabase.from('skills_exchange').select(`
        *,
        profiles:user_id (
          avatar_url,
          display_name
        )
      `).order('created_at', { ascending: false });
      
      // Add category filter if selected
      if (selectedCategory) {
        query = query.eq('skill_category', selectedCategory);
      }
      
      // Add search filter if provided
      if (searchQuery) {
        // Search in title and description
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
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

  // Filter out deleted activities
  const filteredSkills = skills || [];
  
  // Further separate by request type
  const requests = filteredSkills.filter(skill => skill.request_type === 'need') || [];
  const offers = filteredSkills.filter(skill => skill.request_type === 'offer') || [];

  // Show a special empty state for search with no results
  if (searchQuery && filteredSkills.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title={`No results found for "${searchQuery}"`}
        description="Try a different search term or browse by category"
        actionLabel="Clear Search"
        onAction={() => window.location.href = '/skills'} // Simple page refresh to clear search
      />
    );
  }

  return (
    <div className="space-y-8">
      {requests.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Skill Requests</h3>
          {/* Redesigned more compact horizontal scrolling card layout */}
          <div className="bg-[#F8F8F8] p-3 rounded-lg overflow-x-auto">
            <div className="flex gap-3">
              {requests.map(request => (
                <SkillCard
                  key={request.id}
                  skill={request}
                  type="request"
                  onContribute={() => setSelectedSkill({
                    id: request.id,
                    title: request.title,
                    requesterId: request.user_id
                  })}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Skill Requests</h3>
          <EmptyState
            icon={Sparkles}
            title={`No ${selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : ''} Skill Requests Yet`}
            description={`Be the first to request ${selectedCategory || 'a'} skill from the community`}
            actionLabel={`Request ${selectedCategory ? 'a ' + selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'a'} Skill`}
            onAction={() => setSelectedSkill(null)}
          />
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Available Skills</h3>
        {offers.length > 0 ? (
          <div className="space-y-4">
            {offers.map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                type="offer"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title={`No ${selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : ''} Skills Available`}
            description={`Be the first to share your ${selectedCategory || ''} skills with the community`}
            actionLabel={`Share ${selectedCategory ? 'a ' + selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'a'} Skill`}
            onAction={() => setSelectedSkill(null)}
          />
        )}
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
