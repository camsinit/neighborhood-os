
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Phone, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createTemplatedNotification } from '@/utils/notifications/templatedNotificationService';

/**
 * SkillContactPopover - Shows all providers of a skill with their preferred contact method
 * 
 * This component creates a popover that displays neighbors who offer a specific skill
 * along with their single preferred contact method (phone > email > generic contact).
 * Respects privacy settings from user onboarding.
 * 
 * UPDATED: Now uses the new templated notification system for consistent messaging
 */
interface SkillContactPopoverProps {
  skillTitle: string;
  skillCategory: string;
  children: React.ReactNode;
  onContactReveal?: (providerId: string, skillTitle: string) => void;
}

interface SkillProvider {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email_visible: boolean;
  phone_visible: boolean;
  phone_number: string | null;
  email?: string | null;
  preferredContactMethod: 'phone' | 'email' | 'app';
  contactValue: string | null;
}

const SkillContactPopover: React.FC<SkillContactPopoverProps> = ({
  skillTitle,
  skillCategory,
  children,
  onContactReveal
}) => {
  const user = useUser();

  // Fetch all providers of this skill with their contact preferences
  const { data: providers, isLoading, error } = useQuery({
    queryKey: ['skill-providers', skillTitle, skillCategory, user?.id],
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

      // Fetch skill providers with their contact preferences
      const { data: skills, error } = await supabase
        .from('skills_exchange')
        .select(`
          user_id,
          profiles:user_id (
            display_name,
            avatar_url,
            email_visible,
            phone_visible,
            phone_number
          )
        `)
        .eq('neighborhood_id', userNeighborhood.neighborhood_id)
        .eq('skill_category', skillCategory)
        .eq('title', skillTitle)
        .eq('request_type', 'offer')
        .eq('is_archived', false)
        .neq('user_id', user.id); // Don't include current user

      if (error) throw error;

      // Process providers and determine preferred contact method
      const processedProviders: SkillProvider[] = [];
      
      for (const skill of skills || []) {
        const profile = skill.profiles;
        if (!profile) continue;

        let preferredContactMethod: 'phone' | 'email' | 'app' = 'app';
        let contactValue: string | null = null;

        // Priority: phone > email > app
        if (profile.phone_visible && profile.phone_number) {
          preferredContactMethod = 'phone';
          contactValue = profile.phone_number;
        } else if (profile.email_visible) {
          // Fetch email from auth.users if email is visible
          const { data: authUser } = await supabase.auth.admin.getUserById(skill.user_id);
          if (authUser.user?.email) {
            preferredContactMethod = 'email';
            contactValue = authUser.user.email;
          }
        }

        processedProviders.push({
          user_id: skill.user_id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          email_visible: profile.email_visible,
          phone_visible: profile.phone_visible,
          phone_number: profile.phone_number,
          preferredContactMethod,
          contactValue
        });
      }

      return processedProviders;
    },
    enabled: !!user
  });

  // Handle contact reveal and create notification using the new templated system
  const handleContactReveal = async (provider: SkillProvider) => {
    if (!user) return;

    try {
      // Get the current user's display name for the notification
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      const actorName = currentUserProfile?.display_name || 'A neighbor';

      // Create notification using the new templated system
      // This ensures proper actor name display and module-specific styling
      await createTemplatedNotification({
        templateId: 'skill_session_request',
        recipientUserId: provider.user_id,
        actorUserId: user.id,
        contentId: provider.user_id, // Using provider's user_id as content_id for consistency
        variables: {
          actor: actorName,
          title: skillTitle
        },
        metadata: {
          skillTitle,
          skillCategory,
          contextType: 'skill_interest_request',
          interestedUserId: user.id,
          requestedContact: provider.preferredContactMethod
        }
      });

      // Call optional callback
      if (onContactReveal) {
        onContactReveal(provider.user_id, skillTitle);
      }

      toast.success('Interest shown! The neighbor has been notified.');
    } catch (error) {
      console.error('Error handling contact reveal:', error);
      toast.error('Failed to show interest. Please try again.');
    }
  };

  // Render contact method icon and value
  const renderContactMethod = (provider: SkillProvider) => {
    switch (provider.preferredContactMethod) {
      case 'phone':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{provider.contactValue}</span>
          </div>
        );
      case 'email':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{provider.contactValue}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageCircle className="h-4 w-4" />
            <span>Contact via app</span>
          </div>
        );
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Neighbors offering: {skillTitle}
          </h3>
          
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Loading providers...</span>
            </div>
          )}
          
          {error && (
            <div className="text-center py-4 text-red-500 text-sm">
              Error loading providers. Please try again.
            </div>
          )}
          
          {providers && providers.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No providers found for this skill.
            </div>
          )}
          
          {providers && providers.length > 0 && (
            <div className="space-y-3">
              {providers.map((provider) => (
                <div
                  key={provider.user_id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={provider.avatar_url || undefined} />
                      <AvatarFallback className="text-sm">
                        {provider.display_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {provider.display_name || 'Anonymous'}
                      </p>
                      {renderContactMethod(provider)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleContactReveal(provider)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Contact
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SkillContactPopover;
