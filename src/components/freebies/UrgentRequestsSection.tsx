
import React, { useState } from 'react';
import { GoodsExchangeItem } from '@/types/localTypes';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UrgentRequestsSectionProps {
  urgentRequests: GoodsExchangeItem[];
  onRequestSelect: (request: GoodsExchangeItem) => void;
  getUrgencyClass: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
}

const UrgentRequestsSection: React.FC<UrgentRequestsSectionProps> = ({
  urgentRequests,
  onRequestSelect,
  getUrgencyClass,
  getUrgencyLabel
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Urgent Requests</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {urgentRequests.map((request) => (
          <div
            key={request.id}
            onClick={() => onRequestSelect(request)}
            className="bg-white border border-red-100 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <Badge className={getUrgencyClass(request.urgency || 'medium')}>
                {getUrgencyLabel(request.urgency || 'medium')}
              </Badge>
            </div>
            <h4 className="font-medium text-lg mb-1 line-clamp-1">{request.title}</h4>
            <p className="text-gray-600 line-clamp-2 mb-3">{request.description}</p>
            <div className="flex items-center mt-2">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={request.profiles?.avatar_url || undefined} />
                <AvatarFallback>{request.profiles?.display_name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{request.profiles?.display_name || 'Anonymous'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrgentRequestsSection;
