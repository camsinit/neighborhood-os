
import React, { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2 } from 'lucide-react';
import { useSkillProviders } from './hooks/useSkillProviders';
import { ProviderCard } from './components/ProviderCard';
import { ContactNotificationService } from './services/contactNotificationService';

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
 * Shows providers with a single "Contact" button that:
 * 1. Reveals the provider's preferred contact method to the requester
 * 2. Sends a notification to the provider with the requester's contact info
 * 
 * REFACTORED: Split into smaller, focused components for better maintainability
 */
const SkillContactPopover: React.FC<SkillContactPopoverProps> = ({
  skillTitle,
  skillCategory,
  children,
  onContactReveal
}) => {
  const user = useUser();
  const [revealedContacts, setRevealedContacts] = useState<Set<string>>(new Set());

  // Use our custom hook to fetch skill providers
  const { data: providers, isLoading, error } = useSkillProviders(skillTitle, skillCategory);

  /**
   * Handles when a user clicks the "Contact" button for a provider
   * Reveals contact info and sends notification
   */
  const handleContactReveal = async (provider: any) => {
    if (!user) return;

    // Use our service to handle the contact reveal logic
    const success = await ContactNotificationService.handleContactReveal(
      provider, 
      skillTitle, 
      user.id
    );

    if (success) {
      // Mark this contact as revealed locally
      setRevealedContacts(prev => new Set(prev).add(provider.user_id));

      // Call optional callback
      if (onContactReveal) {
        onContactReveal(provider.user_id, skillTitle);
      }
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
          
          {/* Providers list */}
          {providers && providers.length > 0 && (
            <div className="space-y-3">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.user_id}
                  provider={provider}
                  isContactRevealed={revealedContacts.has(provider.user_id)}
                  onContactReveal={handleContactReveal}
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
