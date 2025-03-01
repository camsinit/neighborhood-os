
// This component displays image previews with delete buttons
import { X } from "lucide-react";

// Props for the ImagePreview component
interface SingleImagePreviewProps {
  image: string;
  index: number;
  onRemove: (index: number) => void;
}

/**
 * SingleImagePreview - Displays a single image with a remove button
 * 
 * This component shows an image thumbnail with an overlay delete button
 * that appears on hover
 */
export const SingleImagePreview = ({ image, index, onRemove }: SingleImagePreviewProps) => {
  return (
    <div className="relative group">
      {/* The image itself */}
      <img 
        src={image} 
        alt={`Item ${index+1}`} 
        className="w-full h-20 object-cover rounded-md"
      />
      {/* Overlay delete button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove image"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

// Props for the ImagesGrid component
interface ImagesGridProps {
  images: string[];
  onRemoveImage: (index: number) => void;
}

/**
 * ImagesGrid - Displays a grid of image previews
 * 
 * This component organizes multiple image previews in a grid layout
 */
export const ImagesGrid = ({ images, onRemoveImage }: ImagesGridProps) => {
  if (!images || images.length === 0) return null;
  
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {images.map((img, index) => (
        <SingleImagePreview 
          key={index} 
          image={img} 
          index={index} 
          onRemove={onRemoveImage} 
        />
      ))}
    </div>
  );
};

// Props for the SingleImageView component
interface SingleImageViewProps {
  image: string | null;
  onRemove: (index: number) => void;
}

/**
 * SingleImageView - Displays a single larger image preview
 * 
 * Used for request forms where only one image is allowed
 */
export const SingleImageView = ({ image, onRemove }: SingleImageViewProps) => {
  if (!image) return null;
  
  return (
    <div className="relative group mb-4">
      <img 
        src={image} 
        alt="Item preview" 
        className="w-full h-40 object-cover rounded-md"
      />
      <button
        type="button"
        onClick={() => onRemove(0)}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove image"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};
