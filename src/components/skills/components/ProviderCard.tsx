
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SkillProvider } from '../hooks/useSkillProviders';
import { ContactMethodDisplay } from './ContactMethodDisplay';

/**
 * Props for the ProviderCard component
 */
interface ProviderCardProps {
  provider: SkillProvider;
  isContactRevealed: boolean;
  onContactReveal: (provider: SkillProvider) => void;
}

/**
 * Component that displays an individual skill provider's information
 * Includes avatar, name, and contact reveal functionality
 */
export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  isContactRevealed,
  onContactReveal
}) => {
  return (
    <div className="p-3 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        {/* Provider basic info section */}
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
        
        {/* Contact button - only show if contact hasn't been revealed yet */}
        {!isContactRevealed && (
          <Button
            size="sm"
            onClick={() => onContactReveal(provider)}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Contact
          </Button>
        )}
      </div>
      
      {/* Contact method display - shows after contact is revealed */}
      <ContactMethodDisplay 
        provider={provider} 
        isRevealed={isContactRevealed} 
      />
    </div>
  );
};
