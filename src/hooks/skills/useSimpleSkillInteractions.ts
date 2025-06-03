
import { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for handling simple skill interactions - showing/hiding contact info
 * Replaces the complex scheduling system with direct contact sharing
 */
export const useSimpleSkillInteractions = () => {
  const [shownContacts, setShownContacts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  /**
   * Show interest in a skill and reveal contact information
   * This replaces the old "Request Session" functionality
   */
  const showInterest = async (skillId: string, skillOwnerId: string, skillTitle: string) => {
    if (!user) {
      toast.error('Please log in to express interest');
      return;
    }

    setIsLoading(true);
    try {
      // Get the skill owner's contact preferences
      const { data: ownerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, phone_number, address, email_visible, phone_visible, address_visible')
        .eq('id', skillOwnerId)
        .single();

      if (profileError) {
        console.error('Error fetching owner profile:', profileError);
        toast.error('Could not load contact information');
        return;
      }

      // Get the user's email from auth (always available)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      // Build contact info based on visibility preferences
      const contactInfo: any = {};
      
      if (ownerProfile.email_visible && authUser?.email) {
        contactInfo.email = authUser.email;
      }
      
      if (ownerProfile.phone_visible && ownerProfile.phone_number) {
        contactInfo.phone = ownerProfile.phone_number;
      }
      
      if (ownerProfile.address_visible && ownerProfile.address) {
        contactInfo.address = ownerProfile.address;
      }

      // Store the contact info locally for display
      setShownContacts(prev => new Set(prev).add(skillId));

      // Create a simple notification for the skill owner using valid action_type
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: skillOwnerId,
          actor_id: user.id,
          title: `Someone is interested in your skill: ${skillTitle}`,
          content_type: 'skills',
          content_id: skillId,
          notification_type: 'skills',
          action_type: 'view', // Changed from 'contact' to 'view' which is a valid enum value
          action_label: 'View Interest',
          relevance_score: 3,
          metadata: {
            skillId,
            skillTitle,
            contextType: 'skill_interest',
            interestedUserId: user.id
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't show error to user since contact reveal still worked
      }

      toast.success('Contact information revealed!');
      return contactInfo;

    } catch (error) {
      console.error('Error showing interest:', error);
      toast.error('Failed to show interest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Hide contact information for a skill
   */
  const hideContact = (skillId: string) => {
    setShownContacts(prev => {
      const newSet = new Set(prev);
      newSet.delete(skillId);
      return newSet;
    });
  };

  /**
   * Check if contact info is currently shown for a skill
   */
  const isContactShown = (skillId: string) => {
    return shownContacts.has(skillId);
  };

  return {
    showInterest,
    hideContact,
    isContactShown,
    isLoading
  };
};
