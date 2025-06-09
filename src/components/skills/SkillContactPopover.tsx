
import React from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Mail, Clock, Heart } from 'lucide-react';
import { useSkillProviders } from './hooks/useSkillProviders';
import { Button } from '@/components/ui/button';

/**
 * Props for the SkillContactPopover component
 */
interface SkillContactPopoverProps {
  skillTitle: string;
  skillCategory: string;
  children: React.ReactNode;
  onContactReveal?: (providerId: string, skillTitle: string) => void;
}

/**
 * SkillContactPopover - Shows available neighbors who can help with a specific skill
 * 
 * This component provides clear guidance on how to respectfully reach out to neighbors
 * and makes the interaction feel more personal and community-oriented.
 */
const SkillContactPopover: React.FC<SkillContactPopoverProps> = ({
  skillTitle,
  skillCategory,
  children,
  onContactReveal
}) => {
  const user = useUser();

  // Use our custom hook to fetch skill providers
  const { data: providers, isLoading, error } = useSkillProviders(skillTitle, skillCategory);

  // Create a helpful email template
  const createEmailLink = (providerEmail: string, providerName: string) => {
    const subject = encodeURIComponent(`Help with ${skillTitle}?`);
    const body = encodeURIComponent(
      `Hi ${providerName},\n\n` +
      `I saw that you might be able to help with ${skillTitle.toLowerCase()}. ` +
      `I'd really appreciate any guidance or assistance you could offer.\n\n` +
      `I'm flexible with timing and happy to work around your schedule. ` +
      `Please let me know if you're available and what would work best for you.\n\n` +
      `Thank you for being such a helpful neighbor!\n\n` +
      `Best regards`
    );
    return `mailto:${providerEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-6">
          {/* Header with clear, friendly messaging */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Get help with {skillTitle.toLowerCase()}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Here are your neighbors who can help with this skill.
            </p>
          </div>
          
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-gray-500">Finding helpful neighbors...</span>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 text-sm mb-2">
                Couldn't load neighbors right now
              </div>
              <p className="text-xs text-gray-500">Please try again in a moment</p>
            </div>
          )}
          
          {/* Empty state with encouragement */}
          {providers && providers.length === 0 && (
            <div className="text-center py-8 space-y-3">
              <Heart className="h-8 w-8 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  No neighbors offering this skill yet
                </p>
                <p className="text-xs text-gray-500">
                  Try posting a request - someone might be able to help!
                </p>
              </div>
            </div>
          )}
          
          {/* Providers list with simple, clean design */}
          {providers && providers.length > 0 && (
            <div className="space-y-4">
              {providers.map((provider) => (
                <div
                  key={provider.user_id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  {/* Provider info */}
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {provider.user_profiles?.display_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {provider.user_profiles?.display_name || 'Neighbor'}
                      </h4>
                      {provider.skill_description && (
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          "{provider.skill_description}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact information and guidance */}
                  <div className="space-y-3">
                    {/* Contact method */}
                    {provider.user_profiles?.email && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span>{provider.user_profiles.email}</span>
                      </div>
                    )}

                    {/* Time preference hint */}
                    {provider.time_preferences && provider.time_preferences.length > 0 && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>Prefers {provider.time_preferences.join(', ').toLowerCase()} times</span>
                      </div>
                    )}

                    {/* Contact button with helpful text */}
                    <div className="pt-2">
                      <Button
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          if (provider.user_profiles?.email) {
                            window.open(createEmailLink(
                              provider.user_profiles.email, 
                              provider.user_profiles.display_name || 'Neighbor'
                            ), '_blank');
                          }
                        }}
                      >
                        Send a friendly message
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Footer with community guidelines */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-700">
                    💝 Tips for reaching out:
                  </h5>
                  <ul className="text-xs text-gray-600 space-y-1 leading-relaxed">
                    <li>• Be specific about what help you need</li>
                    <li>• Suggest a few time options that work for you</li>
                    <li>• Offer to bring coffee or a small thank you</li>
                    <li>• Be understanding if they can't help right now</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SkillContactPopover;
