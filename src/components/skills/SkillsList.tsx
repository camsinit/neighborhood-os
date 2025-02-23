import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skill, SkillCategory } from './types/skillTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@supabase/auth-helpers-react';
import SkillContributionDialog from './SkillContributionDialog';
import SkillCard from './list/SkillCard';
import EmptyState from '@/components/ui/empty-state';
import { Sparkles } from 'lucide-react';
import AddSupportRequestDialog from '@/components/AddSupportRequestDialog';

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
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);

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

  // If there are no skills at all
  if ((!requests.length && !offers.length) || !skills?.length) {
    return (
      <>
        <EmptyState
          icon={Sparkles}
          title={selectedCategory 
            ? `No ${selectedCategory} skills yet`
            : "No skills shared yet"}
          description={selectedCategory 
            ? `Be the first to share your ${selectedCategory} skills with the community`
            : "Share your skills with the community or request help from others"}
          actionLabel="Share a Skill"
          onAction={() => setIsAddSkillOpen(true)}
        />
        <AddSupportRequestDialog
          open={isAddSkillOpen}
          onOpenChange={setIsAddSkillOpen}
          view="skills"
          initialRequestType="offer"
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      {requests.length > 0 && (
        <div>
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-2 px-2">
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
      )}

      <div className="space-y-4">
        {offers.map(skill => (
          <SkillCard
            key={skill.id}
            skill={skill}
            type="offer"
            onRequest={() => {/* Handle request */}}
          />
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
