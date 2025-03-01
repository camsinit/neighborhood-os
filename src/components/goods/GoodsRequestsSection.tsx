
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import { GoodsExchangeItem } from '@/types/localTypes';
import { GoodsRequestUrgency } from '@/components/support/types/formTypes';

/**
 * Component to display non-urgent goods requests
 * 
 * This section shows regular priority needs from the community
 * Items are filtered to exclude those already shown in the urgent section
 */
interface GoodsRequestsSectionProps {
  goodsRequests: GoodsExchangeItem[];
  urgentRequests: GoodsExchangeItem[];
  onRequestSelect: (request: GoodsExchangeItem) => void;
  getUrgencyClass: (urgency: GoodsRequestUrgency) => string;
  getUrgencyLabel: (urgency: GoodsRequestUrgency) => string;
}

const GoodsRequestsSection = ({ 
  goodsRequests,
  urgentRequests,
  onRequestSelect,
  getUrgencyClass,
  getUrgencyLabel,
}: GoodsRequestsSectionProps) => {
  // Only show this section if there are non-urgent requests
  if (goodsRequests.length === 0 || urgentRequests.length >= goodsRequests.length) {
    return null;
  }
  
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Other Item Requests</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goodsRequests
          .filter(req => {
            // Filter out requests that are already shown in the urgent section
            return req.urgency !== 'high' && req.urgency !== 'critical';
          })
          .map(request => (
            <div 
              key={request.id}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer relative"
              onClick={() => onRequestSelect(request)}
            >
              <div className="flex justify-between">
                <h3 className="font-medium text-lg">{request.title}</h3>
                {request.urgency && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getUrgencyClass(request.urgency as GoodsRequestUrgency)
                  }`}>
                    {getUrgencyLabel(request.urgency as GoodsRequestUrgency)}
                  </span>
                )}
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

export default GoodsRequestsSection;
