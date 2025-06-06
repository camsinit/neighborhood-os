
import React from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2 } from 'lucide-react';
import { useSkillProviders } from './hooks/useSkillProviders';
import { ProviderCard } from './components/ProviderCard';

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
 * SkillContactPopover - Simplified skill request interface
 * 
 * Shows providers with their contact information immediately visible
 * No longer requires a separate "Contact" button - info is shown right away
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
            Here are neighbors who can help with this skill:
          </p>
          
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Loading providers...</span>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="text-center py-4 text-red-500 text-sm">
              Error loading providers. Please try again.
            </div>
          )}
          
          {/* Empty state */}
          {providers && providers.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No providers found for this skill.
            </div>
          )}
          
          {/* Providers list - contact info is shown immediately */}
          {providers && providers.length > 0 && (
            <div className="space-y-3">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.user_id}
                  provider={provider}
                  isContactRevealed={true} // Always show contact info immediately
                  onContactReveal={() => {}} // No longer needed since info is always shown
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SkillContactPopover;
