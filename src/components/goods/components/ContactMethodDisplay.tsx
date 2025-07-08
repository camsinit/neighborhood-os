import React from 'react';
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import { GoodsExchangeItem } from '@/types/localTypes';

/**
 * Props for the ContactMethodDisplay component for goods
 */
interface ContactMethodDisplayProps {
  item: GoodsExchangeItem;
  isRevealed: boolean;
}

/**
 * Component that displays contact information for a goods item provider
 * Shows available contact methods when revealed
 */
export const ContactMethodDisplay: React.FC<ContactMethodDisplayProps> = ({ 
  item, 
  isRevealed 
}) => {
  // Don't show anything if contact hasn't been revealed yet
  if (!isRevealed) {
    return null;
  }

  // Check what contact information is available and visible
  const hasPhone = (item.profiles as any)?.phone_visible && (item.profiles as any)?.phone_number;
  const hasEmail = (item.profiles as any)?.email_visible;
  const hasAddress = (item.profiles as any)?.address_visible && (item.profiles as any)?.address;
  const hasAnyContact = hasPhone || hasEmail || hasAddress;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm mt-2">
      <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
        <span>📬</span> Contact for pickup:
      </h5>
      <div className="space-y-1">
        {hasPhone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-green-50 rounded">
            <Phone className="h-4 w-4" />
            <span className="font-mono">{(item.profiles as any).phone_number}</span>
          </div>
        )}
        
        {hasEmail && (
          <div className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-green-50 rounded">
            <Mail className="h-4 w-4" />
            <span>Contact through platform</span>
          </div>
        )}
        
        {hasAddress && (
          <div className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-green-50 rounded">
            <MapPin className="h-4 w-4" />
            <span>{(item.profiles as any).address}</span>
          </div>
        )}
        
        {!hasAnyContact && (
          <div className="text-sm text-gray-600 p-2 bg-yellow-50 rounded border border-yellow-200">
            <MessageCircle className="h-4 w-4 inline mr-2" />
            Contact information not publicly available. Consider reaching out through the neighborhood network.
          </div>
        )}
      </div>
    </div>
  );
};