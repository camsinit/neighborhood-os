
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CalendarClock, AlertCircle } from "lucide-react";
import { GoodsExchangeItem } from '@/types/localTypes';
import { GoodsRequestUrgency } from '@/components/support/types/formTypes';

/**
 * Component to display urgent goods requests
 * 
 * This section shows high-priority needs that require immediate attention
 * Each request includes urgency level, title, description, and action button
 */
interface UrgentRequestsSectionProps {
  urgentRequests: GoodsExchangeItem[];
  onRequestSelect: (request: GoodsExchangeItem) => void;
  getUrgencyClass: (urgency: GoodsRequestUrgency) => string;
  getUrgencyLabel: (urgency: GoodsRequestUrgency) => string;
}

const UrgentRequestsSection = ({ 
  urgentRequests,
  onRequestSelect,
  getUrgencyClass,
  getUrgencyLabel,
}: UrgentRequestsSectionProps) => {
  // Don't render anything if there are no urgent requests
  if (urgentRequests.length === 0) return null;
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
      {/* Section header with icon */}
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <h3 className="text-lg font-medium">Urgent Neighbor Requests</h3>
      </div>
      
      {/* Grid of urgent request cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {urgentRequests.map(request => (
          <div 
            key={request.id}
            className="bg-red-50 border border-red-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer relative"
            onClick={() => onRequestSelect(request)}
          >
            <div className="flex justify-between">
              <h3 className="font-medium text-lg">{request.title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getUrgencyClass(request.urgency as GoodsRequestUrgency)
              }`}>
                {getUrgencyLabel(request.urgency as GoodsRequestUrgency)}
              </span>
            </div>
            <p className="text-gray-600 mt-1 line-clamp-2">{request.description}</p>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CalendarClock className="h-3 w-3" />
                <span>Posted {new Date(request.created_at).toLocaleDateString()}</span>
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                I Can Help
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrgentRequestsSection;
