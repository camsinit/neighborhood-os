
import React from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { SkillProvider } from '../hooks/useSkillProviders';

/**
 * Props for the ContactMethodDisplay component
 */
interface ContactMethodDisplayProps {
  provider: SkillProvider;
  isRevealed: boolean;
}

/**
 * Component that displays the contact method for a skill provider
 * Only shows contact info after it has been revealed by the user
 */
export const ContactMethodDisplay: React.FC<ContactMethodDisplayProps> = ({ 
  provider, 
  isRevealed 
}) => {
  // Don't show anything if contact hasn't been revealed yet
  if (!isRevealed) {
    return null;
  }

  // Render the appropriate contact method based on provider's preference
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
      // Fallback case for app-based contact
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 p-2 bg-green-50 rounded">
          <MessageCircle className="h-4 w-4" />
          <span>Contact via app notifications</span>
        </div>
      );
  }
};
