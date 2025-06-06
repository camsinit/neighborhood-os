
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
 * Component that displays the exact contact method for a skill provider
 * Shows their actual phone number or email address based on their preference
 * Always shows contact info when isRevealed is true
 */
export const ContactMethodDisplay: React.FC<ContactMethodDisplayProps> = ({ 
  provider, 
  isRevealed 
}) => {
  // Don't show anything if contact hasn't been revealed yet
  if (!isRevealed) {
    return null;
  }

  // Display the exact contact information based on their preferred method
  switch (provider.preferredContactMethod) {
    case 'phone':
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 p-2 bg-green-50 rounded">
          <Phone className="h-4 w-4" />
          <span>{provider.phone_number}</span>
        </div>
      );
    
    case 'email':
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 p-2 bg-green-50 rounded">
          <Mail className="h-4 w-4" />
          <span>{provider.email || provider.contactValue}</span>
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
