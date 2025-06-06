import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Phone, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * SkillContactPopover - Simplified skill request interface
 * 
 * Shows providers with a single "Contact" button that:
 * 1. Reveals the provider's preferred contact method to the requester
 * 2. Sends a notification to the provider with the requester's contact info
 * 
 * UPDATED: Simplified UI with description and single contact action
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
  const [revealedContacts, setRevealedContacts] = useState<Set<string>>(new Set());

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

      // Fetch skill providers with their contact preferences and email
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
          ),
          auth_users:user_id (
            email
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
        const authUser = skill.auth_users;
        if (!profile) continue;

        let preferredContactMethod: 'phone' | 'email' | 'app' = 'app';
        let contactValue: string | null = null;

        // Check if phone is visible and available
        if (profile.phone_visible && profile.phone_number) {
          preferredContactMethod = 'phone';
          contactValue = profile.phone_number;
        } else if (profile.email_visible && authUser?.email) {
          preferredContactMethod = 'email';
          contactValue = authUser.email;
        }

        processedProviders.push({
          user_id: skill.user_id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          email_visible: profile.email_visible,
          phone_visible: profile.phone_visible,
          phone_number: profile.phone_number,
          email: authUser?.email,
          preferredContactMethod,
          contactValue
        });
      }

      return processedProviders;
    },
    enabled: !!user
  });

  // Handle contact reveal and create notification with requester's contact info
  const handleContactReveal = async (provider: SkillProvider) => {
    if (!user) return;

    try {
      // Get the current user's profile and contact preferences
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('display_name, phone_visible, phone_number, email_visible')
        .eq('id', user.id)
        .single();

      // Get current user's email
      const { data: currentUserData } = await supabase.auth.getUser();
      const requesterEmail = currentUserData?.user?.email;

      const requesterName = requesterProfile?.display_name || 'A neighbor';

      // Determine requester's preferred contact method
      let requesterContactMethod = 'app';
      let requesterContactValue = null;

      if (requesterProfile?.phone_visible && requesterProfile?.phone_number) {
        requesterContactMethod = 'phone';
        requesterContactValue = requesterProfile.phone_number;
      } else if (requesterProfile?.email_visible && requesterEmail) {
        requesterContactMethod = 'email';
        requesterContactValue = requesterEmail;
      }

      // Create notification using the unified notification system
      const { error: notificationError } = await supabase
        .rpc('create_unified_system_notification', {
          p_user_id: provider.user_id,
          p_actor_id: user.id,
          p_title: `${requesterName} is interested in your ${skillTitle} skill`,
          p_content_type: 'skills',
          p_content_id: provider.user_id,
          p_notification_type: 'skills',
          p_action_type: 'respond',
          p_action_label: 'View Interest',
          p_relevance_score: 3,
          p_metadata: {
            skillTitle,
            skillCategory,
            contextType: 'skill_interest_request',
            interestedUserId: user.id,
            requesterContactMethod,
            requesterContactValue,
            requesterName
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        toast.error('Failed to notify the neighbor. Please try again.');
        return;
      }

      // Mark this contact as revealed
      setRevealedContacts(prev => new Set(prev).add(provider.user_id));

      // Call optional callback
      if (onContactReveal) {
        onContactReveal(provider.user_id, skillTitle);
      }

      toast.success('Contact info revealed! The neighbor has been notified.');
    } catch (error) {
      console.error('Error handling contact reveal:', error);
      toast.error('Failed to reveal contact. Please try again.');
    }
  };

  // Render contact method icon and value (always show after revelation)
  const renderContactMethod = (provider: SkillProvider) => {
    if (!revealedContacts.has(provider.user_id)) {
      return null; // Don't show contact info until revealed
    }

    // Always show the actual contact method that was determined
    switch (provider.preferredContactMethod) {
      case 'phone':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 p-2 bg-green-50 rounded">
            <Phone className="h-4 w-4" />
            <span>{provider.contactValue}</span>
          </div>
        );
      case 'email':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 p-2 bg-green-50 rounded">
            <Mail className="h-4 w-4" />
            <span>{provider.contactValue}</span>
          </div>
        );
      default:
        // This should rarely happen now, but keep as fallback
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 p-2 bg-green-50 rounded">
            <MessageCircle className="h-4 w-4" />
            <span>Contact via app notifications</span>
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
          <h3 className="font-semibold text-gray-900 mb-2">
            Request help with: {skillTitle}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Click "Contact" to reveal their contact info and let them know you need help.
          </p>
          
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
                  className="p-3 rounded-lg border border-gray-200 bg-white"
                >
                  <div className="flex items-center justify-between">
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
                      </div>
                    </div>
                    
                    {!revealedContacts.has(provider.user_id) && (
                      <Button
                        size="sm"
                        onClick={() => handleContactReveal(provider)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Contact
                      </Button>
                    )}
                  </div>
                  
                  {renderContactMethod(provider)}
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
