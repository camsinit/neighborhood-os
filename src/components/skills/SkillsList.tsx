
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skill, SkillCategory } from './types/skillTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@supabase/auth-helpers-react';
import SkillContributionDialog from './SkillContributionDialog';
import SkillCard from './list/SkillCard';
import EmptyState from '@/components/ui/empty-state';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNeighborhood } from '@/hooks/useNeighborhood';
import { toast } from 'sonner';

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
  
  const { neighborhood, isLoading: isLoadingNeighborhood } = useNeighborhood();

  // Log component rendering for debugging
  useEffect(() => {
    console.log("[SkillsList] Rendering with state:", {
      hasNeighborhood: !!neighborhood,
      neighborhoodId: neighborhood?.id,
      neighborhoodName: neighborhood?.name,
      selectedCategory,
      isLoadingNeighborhood,
      timestamp: new Date().toISOString()
    });
  }, [neighborhood, selectedCategory, isLoadingNeighborhood]);

  const {
    data: skills,
    isLoading,
    error
  } = useQuery({
    queryKey: ['skills-exchange', selectedCategory, neighborhood?.id],
    queryFn: async () => {
      if (!neighborhood?.id) {
        console.log("[SkillsList] No neighborhood selected, returning empty array");
        return [];
      }
      
      console.log("[SkillsList] Fetching skills for neighborhood:", neighborhood.id);
      
      let query = supabase.from('skills_exchange').select(`
        *,
        profiles:user_id (
          avatar_url,
          display_name
        )
      `)
      .eq('neighborhood_id', neighborhood.id)
      .order('created_at', { ascending: false });
      
      if (selectedCategory) {
        query = query.eq('skill_category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) {
        console.error("[SkillsList] Error fetching skills:", error);
        throw error;
      }
      
      console.log("[SkillsList] Fetched skills count:", data?.length || 0);
      return data as (Skill & { profiles: { avatar_url: string | null; display_name: string | null } })[];
    },
    enabled: !!neighborhood?.id && !isLoadingNeighborhood,
    onError: (err) => {
      console.error("[SkillsList] Query error:", err);
      toast.error("Failed to load skills", {
        description: "Please try refreshing the page"
      });
    }
  });

  // Show error state if there's an error
  if (error) {
    console.error("[SkillsList] Rendering error state:", error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-700 font-medium">Error loading skills</h3>
        <p className="text-red-600 text-sm mt-1">{(error as Error).message}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  // Handle request to create a new skill
  const handleRequestSkill = () => {
    console.log("[SkillsList] User wants to request a skill", { selectedCategory });
    // This would typically open your skill request form
    // Placeholder for now
  };
  
  // Handle offer to share a skill
  const handleShareSkill = () => {
    console.log("[SkillsList] User wants to share a skill", { selectedCategory });
    // This would typically open your skill offering form
    // Placeholder for now
  };

  if (isLoading || isLoadingNeighborhood) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
    </div>;
  }
  
  if (!neighborhood) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No Neighborhood Selected"
        description="You need to join a neighborhood to view and share skills"
        actionLabel="Join a Neighborhood"
        onAction={() => {
          // Placeholder action - could navigate to neighborhood joining page
          console.log("User clicked to join a neighborhood");
        }}
      />
    );
  }

  const requests = skills?.filter(skill => skill.request_type === 'need') || [];
  const offers = skills?.filter(skill => skill.request_type === 'offer') || [];

  return (
    <div className="space-y-8">
      {requests.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Skill Requests</h3>
          <div className="bg-[#F8F8F8] p-4 rounded-lg overflow-x-auto">
            <div className="flex gap-4 pb-2">
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
            onAction={handleRequestSkill}
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
            onAction={handleShareSkill}
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

// Importing Button for the error state
import { Button } from "@/components/ui/button";

export default SkillsList;
