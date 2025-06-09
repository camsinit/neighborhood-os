
import React, { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Mail, Phone, MessageCircle, Heart } from 'lucide-react';
import { useSkillProviders } from './hooks/useSkillProviders';

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
 * Updated to display contact information directly instead of a "Send a friendly message" button.
 */
const SkillContactPopover: React.FC<SkillContactPopoverProps> = ({
  skillTitle,
  skillCategory,
  children,
  onContactReveal
}) => {
  const user = useUser();
  const [open, setOpen] = useState(false);

  // Use our custom hook to fetch skill providers
  const { data: providers, isLoading, error } = useSkillProviders(skillTitle, skillCategory);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <div className="p-2">
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
          
          {/* Providers list with contact information displayed directly */}
          {providers && providers.length > 0 && (
            <div className="space-y-4">
              {providers.map((provider) => (
                <div
                  key={provider.user_id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  {/* Provider info with contact information on the right */}
                  <div className="flex items-center justify-between">
                    {/* Left side: Profile and name */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {provider.user_profiles?.display_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">
                          {provider.user_profiles?.display_name || 'Neighbor'}
                        </h4>
                        {provider.skill_description && (
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            "{provider.skill_description}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right side: Contact information */}
                    <div className="flex flex-col items-end space-y-1">
                      {/* Email contact */}
                      {provider.user_profiles?.email && (
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{provider.user_profiles.email}</span>
                        </div>
                      )}

                      {/* Phone contact (if available) */}
                      {provider.user_profiles?.phone_number && (
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{provider.user_profiles.phone_number}</span>
                        </div>
                      )}

                      {/* Time preference hint */}
                      {provider.time_preferences && provider.time_preferences.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Prefers {provider.time_preferences.join(', ').toLowerCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillContactPopover;
