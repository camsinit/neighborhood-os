
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@supabase/auth-helpers-react';

/**
 * Hook for managing simple skill interactions
 * Note: This hook is preserved but currently not used in the main skills flow
 * as we've moved to using the list-style components for consistency
 */
export const useSimpleSkillInteractions = () => {
  const user = useUser();
  const [contactInfoVisible, setContactInfoVisible] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Show interest in a skill and get contact info
  const showInterest = async (skillId: string, skillOwnerId: string, skillTitle: string) => {
    if (!user) {
      toast.error('Please log in to show interest');
      return null;
    }

    setIsLoading(true);
    
    try {
      // Get the skill owner's profile with contact info
      const { data: ownerProfile, error } = await supabase
        .from('profiles')
        .select('display_name, email_visible, phone_visible, address_visible, phone_number, address')
        .eq('id', skillOwnerId)
        .single();

      if (error) {
        console.error('Error fetching owner profile:', error);
        toast.error('Unable to get contact information');
        return null;
      }

      // Mark this skill as having visible contact info
      setContactInfoVisible(prev => new Set(prev).add(skillId));

      // Build contact info object based on visibility settings
      const contactInfo: any = {};
      
      if (ownerProfile.email_visible) {
        // Get email from auth.users table
        const { data: authUser } = await supabase.auth.admin.getUserById(skillOwnerId);
        if (authUser.user?.email) {
          contactInfo.email = authUser.user.email;
        }
      }
      
      if (ownerProfile.phone_visible && ownerProfile.phone_number) {
        contactInfo.phone = ownerProfile.phone_number;
      }
      
      if (ownerProfile.address_visible && ownerProfile.address) {
        contactInfo.address = ownerProfile.address;
      }

      toast.success('Contact information revealed!');
      return contactInfo;

    } catch (error) {
      console.error('Error showing interest:', error);
      toast.error('Something went wrong. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Hide contact info for a skill
  const hideContact = (skillId: string) => {
    setContactInfoVisible(prev => {
      const newSet = new Set(prev);
      newSet.delete(skillId);
      return newSet;
    });
  };

  // Check if contact info is shown for a skill
  const isContactShown = (skillId: string) => {
    return contactInfoVisible.has(skillId);
  };

  return {
    showInterest,
    hideContact,
    isContactShown,
    isLoading
  };
};
