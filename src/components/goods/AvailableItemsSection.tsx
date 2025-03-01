
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { GoodsExchangeItem } from '@/types/localTypes';
import ArchiveButton from "@/components/mutual-support/ArchiveButton";

/**
 * Component to display available goods items offered by neighbors
 * 
 * Shows all items that people are offering, with images and details
 * Includes a placeholder when no items are available
 */
interface AvailableItemsSectionProps {
  goodsItems: GoodsExchangeItem[];
  onRequestSelect: (request: GoodsExchangeItem) => void;
  onNewOffer: () => void;
  onRefetch: () => void;
}

const AvailableItemsSection = ({ 
  goodsItems,
  onRequestSelect,
  onNewOffer,
  onRefetch,
}: AvailableItemsSectionProps) => {
  // When no items are available, show a call-to-action
  if (goodsItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Button 
          variant="outline" 
          onClick={onNewOffer}
          className="w-full p-8 h-auto border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center gap-4"
        >
          <Gift className="h-8 w-8 text-gray-400" />
          <div className="flex flex-col items-center text-center">
            <p className="text-lg font-medium text-gray-900">No items available</p>
            <p className="text-sm text-gray-500 mt-1">Click here to offer an item to your neighbors</p>
          </div>
        </Button>
      </div>
    );
  }
  
  // Display the grid of available items
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {goodsItems.map(request => (
        <div 
          key={request.id}
          className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer relative"
        >
          {/* Main content area that opens the item details */}
          <div onClick={() => onRequestSelect(request)}>
            {/* Item image section - prioritize the main image_url first */}
            {request.image_url && (
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img 
                  src={request.image_url} 
                  alt={request.title}
                  className="object-cover rounded-md h-48 w-full"
                />
              </div>
            )}
            
            {/* If there are multiple images in the images array, show the first one */}
            {request.images && request.images.length > 0 && !request.image_url && (
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img 
                  src={request.images[0]} 
                  alt={request.title}
                  className="object-cover rounded-md h-48 w-full"
                />
                {/* Badge showing how many more images are available */}
                {request.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
                    +{request.images.length - 1} more
                  </div>
                )}
              </div>
            )}
            
            {/* Item details */}
            <h3 className="font-medium text-lg">{request.title}</h3>
            <p className="text-gray-600 mt-1 line-clamp-2">{request.description}</p>
            
            {/* Item category tag if available */}
            {request.goods_category && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {request.goods_category}
                </span>
              </div>
            )}
          </div>
          
          {/* Archive button - positioned in the top right corner */}
          <div className="absolute top-2 right-2">
            <ArchiveButton 
              requestId={request.id}
              tableName="goods_exchange"
              onArchiveComplete={onRefetch}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AvailableItemsSection;
