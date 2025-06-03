
import { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createTemplatedNotification } from '@/utils/notifications/templatedNotificationService';

/**
 * Hook for managing skill contact interactions
 * 
 * This hook handles the logic for requesting skills from neighbors,
 * fetching contact information, and managing interaction state.
 * Extends the existing simple skill interactions with contact management.
 */
export const useSkillContactManagement = () => {
  const [requestedSkills, setRequestedSkills] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  /**
   * Request a skill from all providers and show contact information
   * Creates notifications for all providers of the skill
   */
  const requestSkill = async (skillTitle: string, skillCategory: string) => {
    if (!user) {
      toast.error('Please log in to request skills');
      return;
    }

    setIsLoading(true);
    try {
      // Get user's neighborhood
      const { data: userNeighborhood } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!userNeighborhood) {
        toast.error('You must be part of a neighborhood to request skills');
        return;
      }

      // Get all providers of this skill
      const { data: skillProviders, error } = await supabase
        .from('skills_exchange')
        .select(`
          user_id,
          profiles:user_id (
            display_name
          )
        `)
        .eq('neighborhood_id', userNeighborhood.neighborhood_id)
        .eq('skill_category', skillCategory)
        .eq('title', skillTitle)
        .eq('request_type', 'offer')
        .eq('is_archived', false)
        .neq('user_id', user.id); // Don't include current user

      if (error) {
        console.error('Error fetching skill providers:', error);
        toast.error('Failed to find skill providers');
        return;
      }

      if (!skillProviders || skillProviders.length === 0) {
        toast.error('No providers found for this skill');
        return;
      }

      // Get requester's display name for the notification
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      const requesterName = requesterProfile?.display_name || 'A neighbor';

      // Create notifications for all providers using the templated service
      for (const provider of skillProviders) {
        await createTemplatedNotification({
          templateId: 'skill_interest_request',
          recipientUserId: provider.user_id,
          actorUserId: user.id,
          contentId: provider.user_id,
          variables: {
            actor: requesterName,
            title: skillTitle
          },
          metadata: {
            skillTitle,
            skillCategory,
            contextType: 'skill_interest_request',
            interestedUserId: user.id
          }
        });
      }

      // Mark skill as requested locally
      setRequestedSkills(prev => new Set(prev).add(`${skillTitle}-${skillCategory}`));

      toast.success(`Interest shown! ${skillProviders.length} neighbor(s) have been notified.`);

    } catch (error) {
      console.error('Error requesting skill:', error);
      toast.error('Failed to request skill. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if a skill has been requested
   */
  const isSkillRequested = (skillTitle: string, skillCategory: string) => {
    return requestedSkills.has(`${skillTitle}-${skillCategory}`);
  };

  /**
   * Clear requested status for a skill
   */
  const clearRequestedStatus = (skillTitle: string, skillCategory: string) => {
    setRequestedSkills(prev => {
      const newSet = new Set(prev);
      newSet.delete(`${skillTitle}-${skillCategory}`);
      return newSet;
    });
  };

  return {
    requestSkill,
    isSkillRequested,
    clearRequestedStatus,
    isLoading
  };
};
