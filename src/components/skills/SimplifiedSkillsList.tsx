
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import SimpleSkillCard from './SimpleSkillCard';
import { useSimpleSkillInteractions } from '@/hooks/skills/useSimpleSkillInteractions';
import { Loader2 } from 'lucide-react';

/**
 * Simplified skills list that shows skills without complex scheduling
 * Users can express interest and get contact info directly
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
  const { showInterest, hideContact, isContactShown, isLoading: interactionLoading } = useSimpleSkillInteractions();
  const [contactInfoMap, setContactInfoMap] = useState<Map<string, any>>(new Map());

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
        query = query.eq('request_type', 'need');
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

  // Handle showing interest in a skill
  const handleShowInterest = async (skillId: string, skillOwnerId: string, skillTitle: string) => {
    const contactInfo = await showInterest(skillId, skillOwnerId, skillTitle);
    if (contactInfo) {
      setContactInfoMap(prev => new Map(prev).set(skillId, contactInfo));
    }
  };

  // Handle hiding contact info
  const handleHideContact = (skillId: string) => {
    hideContact(skillId);
    setContactInfoMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(skillId);
      return newMap;
    });
  };

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <SimpleSkillCard
          key={skill.id}
          id={skill.id}
          title={skill.title}
          description={skill.description}
          skillCategory={skill.skill_category}
          requestType={skill.request_type}
          userName={skill.profiles?.display_name || 'Anonymous'}
          userAvatar={skill.profiles?.avatar_url}
          createdAt={skill.created_at}
          showContactInfo={isContactShown(skill.id)}
          contactInfo={contactInfoMap.get(skill.id)}
          onShowInterest={() => handleShowInterest(skill.id, skill.user_id, skill.title)}
          onHideContact={() => handleHideContact(skill.id)}
          isOwnSkill={skill.user_id === user?.id}
        />
      ))}
    </div>
  );
};

export default SimplifiedSkillsList;
