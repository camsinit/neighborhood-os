import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import SkillCard from './list/SkillCard';
import { useSimpleSkillInteractions } from '@/hooks/skills/useSimpleSkillInteractions';
import { Loader2 } from 'lucide-react';
import { SkillCategory, SkillRequestType } from './types/skillTypes';

/**
 * Simplified skills list that displays skills in compact list format
 * Now uses the same list components as the category sections for consistency
 */
interface SimplifiedSkillsListProps {
  showRequests?: boolean; // Show skill requests (needs) instead of offers
  showMine?: boolean; // Show only current user's skills
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

  // Fetch skills with user profiles
  const { data: skills, isLoading, error } = useQuery({
    queryKey: ['simplified-skills', showRequests, showMine, selectedCategory, searchQuery, user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user's neighborhood
      const { data: userNeighborhood } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!userNeighborhood) return [];

      // Build query
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
        .eq('neighborhood_id', userNeighborhood.neighborhood_id)
        .eq('is_archived', false);

      // Filter by request type
      if (showRequests) {
        query = query.eq('request_type', 'request');
      } else if (!showMine) {
        query = query.eq('request_type', 'offer');
      }

      // Filter by user for "My Skills"
      if (showMine) {
        query = query.eq('user_id', user.id);
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
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

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
    const emptyMessage = showMine 
      ? "You haven't shared any skills yet"
      : showRequests 
        ? "No skill requests found"
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
