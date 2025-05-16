import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skill, SkillCategory, SkillWithProfile } from './types/skillTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@supabase/auth-helpers-react';
import SkillCard from './list/SkillCard';
import EmptyState from '@/components/ui/empty-state';
import { Sparkles } from 'lucide-react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';

/**
 * Props for the SkillsList component with enhanced filtering
 */
interface SkillsListProps {
  selectedCategory: SkillCategory | undefined;
  searchQuery?: string;
  showRequests?: boolean; // Prop to toggle between offers and requests view
  showMine?: boolean; // New prop to show only the user's skills
}

const SkillsList = ({
  selectedCategory,
  searchQuery = '',
  showRequests = false,
  showMine = false
}: SkillsListProps) => {
  const user = useUser();
  
  // Setup auto-refresh for skills data
  useAutoRefresh(['skills-exchange'], ['skills-updated']);
  
  // Set up highlight tracking
  const { id: highlightedSkillId } = useHighlightedItem('skill');
  
  const {
    data: skills,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['skills-exchange', selectedCategory, searchQuery, showRequests, showMine],
    queryFn: async () => {
      console.log('[SkillsList] Fetching skills with params:', {
        category: selectedCategory,
        searchQuery,
        showRequests,
        showMine,
        timestamp: new Date().toISOString()
      });
      
      // Start with a base query
      let query = supabase.from('skills_exchange').select(`
        *,
        profiles:user_id (
          id,
          display_name,
          avatar_url
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
      
      // Filter by user ID if showing only mine
      if (showMine && user) {
        query = query.eq('user_id', user.id);
      }

      // Add search filter if provided
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[SkillsList] Error fetching skills:', error);
        throw error;
      }
      
      console.log('[SkillsList] Fetched skills:', {
        count: data?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      // Ensure data conforms to SkillWithProfile type
      return (data || []).map(item => ({
        ...item,
        // Ensure profiles is properly formatted
        profiles: {
          id: item.profiles?.id || null,
          display_name: item.profiles?.display_name || null,
          avatar_url: item.profiles?.avatar_url || null
        }
      })) as SkillWithProfile[];
    },
    // Don't cache for too long to ensure fresh data
    staleTime: 10000, // 10 seconds
    // Enable refetching on window focus to keep data fresh
    refetchOnWindowFocus: true,
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

  // Show appropriate empty state based on the view
  if (filteredSkills.length === 0) {
    let title, description, actionLabel;
    
    if (showMine) {
      title = "You haven't shared any skills yet";
      description = "Share your skills and knowledge with your neighbors";
      actionLabel = "Share a Skill";
    } else if (showRequests) {
      title = selectedCategory 
        ? `No ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Skill Requests Available` 
        : "No Skill Requests Available";
      description = "Be the first to request a skill from your neighbors";
      actionLabel = "Request a Skill";
    } else {
      title = selectedCategory 
        ? `No ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Skills Available` 
        : "No Skills Available";
      description = `Be the first to share your ${selectedCategory || ''} skills with the community`;
      actionLabel = `Share ${selectedCategory ? 'a ' + selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'a'} Skill`;
    }
    
    return <EmptyState 
      icon={Sparkles} 
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={() => window.location.href = '/skills?action=create'}
    />;
  }

  // Render the list of skills with proper highlighting
  return (
    <div className="space-y-4">
      {filteredSkills.map(skill => (
        <SkillCard 
          key={skill.id} 
          skill={skill} 
          type={showRequests ? 'request' : 'offer'}
          isHighlighted={skill.id === highlightedSkillId}
        />
      ))}
    </div>
  );
};

export default SkillsList;
