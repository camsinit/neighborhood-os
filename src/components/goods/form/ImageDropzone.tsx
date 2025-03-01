
// This component handles image uploads with drag and drop functionality
import { useRef } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { ImagesGrid, SingleImageView } from "./ImagePreview";
import UploadArea from "./UploadArea";

// Component props definition
interface ImageDropzoneProps {
  isOfferForm: boolean;
  images?: string[];
  image?: string | null;
  onAddImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  uploading: boolean;
}

/**
 * ImageDropzone component
 * 
 * Provides a drag-and-drop area for uploading images.
 * Displays image previews and allows for removing images.
 * Handles both single image (for requests) and multiple images (for offers).
 */
const ImageDropzone = ({ 
  isOfferForm, 
  images = [], 
  image, 
  onAddImage, 
  onRemoveImage, 
  uploading 
}: ImageDropzoneProps) => {
  // Reference to drop zone div for measurements
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Helper function to process a dropped file
  const handleFileDrop = (file: File) => {
    // Create a synthetic event to reuse the existing handler
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    // Create a synthetic change event
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.files = dataTransfer.files;
    
    // Dispatch the synthetic event
    const syntheticEvent = {
      target: inputElement,
      currentTarget: inputElement,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    onAddImage(syntheticEvent);
  };
  
  // Use our custom hook for drag and drop functionality
  const { 
    isDragging, 
    handleDragEnter, 
    handleDragOver, 
    handleDragLeave, 
    handleDrop 
  } = useDragAndDrop(handleFileDrop);

  return (
    <div className="space-y-2">
      {/* Label changes based on form type */}
      <Label>
        {isOfferForm 
          ? "Images (required)" 
          : "Image (optional)"}
      </Label>
      
      {/* Drop zone container */}
      <div 
        ref={dropZoneRef}
        className={`border rounded-md p-4 bg-gray-50 transition-colors ${isDragging ? 'border-primary bg-blue-50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Image Preview Section - Shows different UI for offers vs requests */}
        {isOfferForm ? (
          <ImagesGrid 
            images={images} 
            onRemoveImage={onRemoveImage} 
          />
        ) : (
          <SingleImageView 
            image={image} 
            onRemove={onRemoveImage} 
          />
        )}
        
        {/* Upload Interface */}
        <UploadArea 
          isDragging={isDragging}
          isOfferForm={isOfferForm}
          hasImages={isOfferForm ? images.length > 0 : !!image}
          onFileSelect={onAddImage}
          uploading={uploading}
          multiple={isOfferForm}
        />
        
        {/* Validation Message - Only shown for offers when no images are uploaded */}
        {isOfferForm && !images.length && (
          <p className="text-xs text-red-500 mt-2 text-center">
            Please upload at least one image of your item
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageDropzone;
