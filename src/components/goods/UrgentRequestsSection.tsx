
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CalendarClock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { GoodsExchangeItem } from '@/types/localTypes';
import { GoodsRequestUrgency } from '@/components/support/types/formTypes';

/**
 * Simple Image Carousel Component
 * 
 * This component displays a small carousel of images in the urgent goods card
 */
const SimpleImageCarousel = ({ images }: { images: string[] }) => {
  // State to track the current image index
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Don't render if no images
  if (!images || images.length === 0) return null;
  
  // Navigate to next image
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Navigate to previous image
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  return (
    <div className="relative h-32 mb-2 rounded-md overflow-hidden">
      <img 
        src={images[currentIndex]} 
        alt="Item image"
        className="w-full h-full object-cover rounded-md"
      />
      
      {/* Only show navigation if more than one image */}
      {images.length > 1 && (
        <>
          <Button 
            onClick={prevImage} 
            size="icon" 
            variant="ghost" 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button 
            onClick={nextImage} 
            size="icon" 
            variant="ghost" 
            className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
          <div className="absolute bottom-1 left-0 right-0 flex justify-center">
            <div className="bg-black/50 text-white text-xs rounded-full px-1.5 py-0.5 text-[10px]">
              {currentIndex + 1}/{images.length}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Helper function to create a contact email link for an item
 * 
 * This formats an email with helpful subject and body text for contacting
 * the person who posted the item
 */
const createContactEmailLink = (request: GoodsExchangeItem) => {
  // Get display name and item details (with fallbacks)
  const posterName = request.profiles?.display_name || "Neighbor";
  const itemTitle = request.title || "your posted item";
  
  // Create a well-formatted email subject
  const subject = encodeURIComponent(`About your item: ${itemTitle}`);
  
  // Create a helpful email body with greeting and context
  const body = encodeURIComponent(
    `Hi ${posterName},\n\nI saw your post for "${itemTitle}" on our neighborhood app and I'd like to help. `+
    `\n\nLet me know when would be a good time to connect about this.\n\nThanks!`
  );
  
  // Use the poster's email if available, otherwise leave blank
  // Safely access the email property which might not exist
  const email = request.profiles?.email || "";
  
  // Return the formatted mailto link
  return `mailto:${email}?subject=${subject}&body=${body}`;
};

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
            {/* Add carousel for images */}
            {request.images || request.image_url ? (
              <SimpleImageCarousel 
                images={request.images || (request.image_url ? [request.image_url] : [])} 
              />
            ) : null}
            
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
              {/* Email Contact button - opens email client */}
              <a 
                href={createContactEmailLink(request)} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} // Prevent opening the details dialog
              >
                <Button size="sm" variant="outline" className="text-xs">
                  I Can Help
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrgentRequestsSection;
