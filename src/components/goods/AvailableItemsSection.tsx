import { Button } from "@/components/ui/button";
import { Gift, ChevronLeft, ChevronRight } from "lucide-react";
import { GoodsExchangeItem } from '@/types/localTypes';
import ArchiveButton from "@/components/mutual-support/ArchiveButton";
import { useState } from "react";

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

/**
 * ImageCarousel - Component to display multiple images with navigation controls
 * 
 * This component handles cycling through multiple images for a single item
 */
const ImageCarousel = ({ images, title }: { images: string[], title: string }) => {
  // State to keep track of which image is currently being shown
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Function to navigate to previous image
  const showPreviousImage = (e: React.MouseEvent) => {
    // Stop the click from bubbling up to parent elements
    e.stopPropagation();
    // Update the index, wrapping around to the end if at the first image
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  // Function to navigate to next image
  const showNextImage = (e: React.MouseEvent) => {
    // Stop the click from bubbling up to parent elements
    e.stopPropagation();
    // Update the index, wrapping around to the beginning if at the last image
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  return (
    <div className="relative aspect-w-16 aspect-h-9 mb-4">
      {/* Current visible image */}
      <img 
        src={images[currentImageIndex]} 
        alt={`${title} - Image ${currentImageIndex + 1}`}
        className="object-cover rounded-md h-48 w-full"
      />
      
      {/* Image counter indicator */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
        {currentImageIndex + 1} / {images.length}
      </div>
      
      {/* Only show navigation buttons if there are multiple images */}
      {images.length > 1 && (
        <>
          {/* Previous image button */}
          <button 
            onClick={showPreviousImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {/* Next image button */}
          <button 
            onClick={showNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
};

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
            {/* Determine which image display to use based on available images */}
            {/* Case 1: Use the main image_url if available */}
            {request.image_url && (
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img 
                  src={request.image_url} 
                  alt={request.title}
                  className="object-cover rounded-md h-48 w-full"
                />
              </div>
            )}
            
            {/* Case 2: If there are images in the images array, use the carousel */}
            {request.images && request.images.length > 0 && !request.image_url && (
              <ImageCarousel 
                images={request.images} 
                title={request.title} 
              />
            )}
            
            {/* Item details */}
            <h3 className="font-medium text-lg">{request.title}</h3>
            <p className="text-gray-600 mt-1 line-clamp-2">{request.description}</p>
            
            {/* Removed category tag as requested */}
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
