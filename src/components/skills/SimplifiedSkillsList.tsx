
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import SkillCard from './list/SkillCard';
import { Loader2 } from 'lucide-react';
import { SkillCategory, SkillRequestType } from './types/skillTypes';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';

/**
 * Simplified skills list that displays skills in compact list format
 * Now uses the same neighborhood filtering approach as other components
 * 
 * Updated filtering logic:
 * - "Requests" tab: Shows ALL skill requests in the neighborhood (including your own)
 * - "My Skills" tab: Shows only YOUR skill offers (things you're offering to help with)
 */
interface SimplifiedSkillsListProps {
  showRequests?: boolean; // Show skill requests (needs) from all neighbors
  showMine?: boolean; // Show only current user's skill offers
  selectedCategory?: string;
  searchQuery?: string;
}

const SimplifiedSkillsList: React.FC<SimplifiedSkillsListProps> = ({
  showRequests = false,
  showMine = false,
  selectedCategory,
  searchQuery = ''
}) => {
  const user = useUser();
  // Use the standardized neighborhood hook instead of manual fetching
  const neighborhood = useCurrentNeighborhood();

  // Log component state for debugging
  useEffect(() => {
    console.log('[SimplifiedSkillsList] Component state:', {
      showRequests,
      showMine,
      selectedCategory,
      searchQuery,
      neighborhood: neighborhood?.name,
      neighborhoodId: neighborhood?.id,
      timestamp: new Date().toISOString()
    });
  }, [showRequests, showMine, selectedCategory, searchQuery, neighborhood]);

  // Fetch skills with user profiles using proper neighborhood filtering
  const { data: skills, isLoading, error } = useQuery({
    // Include neighborhood_id in query key for proper cache isolation
    queryKey: ['simplified-skills', showRequests, showMine, selectedCategory, searchQuery, user?.id, neighborhood?.id],
    queryFn: async () => {
      if (!user) {
        console.log('[SimplifiedSkillsList] No user, returning empty array');
        return [];
      }

      // Check if we have a neighborhood selected
      if (!neighborhood?.id) {
        console.log('[SimplifiedSkillsList] No neighborhood selected, returning empty array');
        return [];
      }

      console.log('[SimplifiedSkillsList] Fetching skills for neighborhood:', {
        neighborhoodId: neighborhood.id,
        neighborhoodName: neighborhood.name,
        showRequests,
        showMine,
        selectedCategory,
        searchQuery,
        timestamp: new Date().toISOString()
      });

      // Build query with neighborhood filtering
      let query = supabase
        .from('skills_exchange')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url,
            email_visible,
            phone_visible,
            address_visible,
            phone_number,
            address
          )
        `)
        .eq('neighborhood_id', neighborhood.id) // Filter by current neighborhood
        .eq('is_archived', false);

      // Apply filtering logic based on the view
      if (showRequests) {
        // Requests tab: Show ALL skill requests in the neighborhood (including user's own)
        // This makes it easier for users to see what requests exist and avoid duplicates
        query = query.eq('request_type', 'need');
      } else if (showMine) {
        // My Skills tab: Show only current user's skill OFFERS (things they're offering to help with)
        query = query
          .eq('request_type', 'offer')
          .eq('user_id', user.id);
      } else {
        // Default offers view: Show all skill offers from everyone
        query = query.eq('request_type', 'offer');
      }

      // Filter by category
      if (selectedCategory) {
        query = query.eq('skill_category', selectedCategory);
      }

      // Search filter
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) {
        console.error('[SimplifiedSkillsList] Error fetching skills:', {
          error,
          neighborhoodId: neighborhood.id,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      console.log('[SimplifiedSkillsList] Successfully fetched skills:', {
        count: data?.length || 0,
        neighborhoodId: neighborhood.id,
        neighborhoodName: neighborhood.name,
        timestamp: new Date().toISOString()
      });

      return data || [];
    },
    // Only run the query if we have both user and neighborhood
    enabled: !!user && !!neighborhood?.id
  });

  // Log final render state for debugging
  useEffect(() => {
    console.log('[SimplifiedSkillsList] Final render state:', {
      isLoading,
      error: error?.message,
      skillsCount: skills?.length || 0,
      timestamp: new Date().toISOString()
    });
  }, [isLoading, error, skills]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading skills...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Error loading skills. Please try again.</p>
      </div>
    );
  }

  if (!skills || skills.length === 0) {
    // Updated empty messages to be more specific
    const emptyMessage = showMine 
      ? "You haven't offered any skills yet. Use the 'Add Skill' button to share what you can help with!"
      : showRequests 
        ? "No skill requests in your neighborhood yet. Be the first to request help!"
        : "No skill offers found";

    return (
      <div className="text-center py-8 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {skills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={{
            ...skill,
            // Cast skill_category from string to SkillCategory type to satisfy TypeScript
            skill_category: skill.skill_category as SkillCategory,
            // Cast request_type from string to SkillRequestType type to satisfy TypeScript
            request_type: skill.request_type as SkillRequestType
          }}
          type={showRequests ? 'request' : 'offer'}
        />
      ))}
    </div>
  );
};

export default SimplifiedSkillsList;
