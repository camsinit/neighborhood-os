
// This component handles image uploads with drag and drop functionality
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";

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
  // State for drag and drop functionality
  const [isDragging, setIsDragging] = useState(false);
  
  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Create a synthetic event to reuse the existing handler
    const dataTransfer = new DataTransfer();
    
    // Get the files from the drop event
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // Check if the file is an image
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error(`File "${file.name}" is not an image`);
      return;
    }
    
    // Add the file to DataTransfer
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

  return (
    <div className="space-y-2">
      <Label>
        {isOfferForm 
          ? "Images (required)" 
          : "Image (optional)"}
      </Label>
      <div 
        className={`border rounded-md p-4 bg-gray-50 transition-colors ${isDragging ? 'border-primary bg-blue-50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Current Images Display */}
        {isOfferForm ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img 
                  src={img} 
                  alt={`Item ${index+1}`} 
                  className="w-full h-20 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : image ? (
          <div className="relative group mb-4">
            <img 
              src={image} 
              alt="Request" 
              className="w-full h-40 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(0)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : null}
        
        {/* Upload Area */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="flex flex-col items-center gap-2">
            <div className={`bg-gray-200 rounded-full p-3 ${isDragging ? 'bg-blue-200' : ''}`}>
              <Upload className="h-6 w-6 text-gray-600" />
            </div>
            <span className="text-sm text-gray-600 text-center">
              {isDragging 
                ? "Drop image(s) here" 
                : isOfferForm && images.length 
                  ? "Drag and drop more images here or click to browse" 
                  : "Drag and drop image(s) here or click to browse"}
            </span>
            <span className="text-xs text-gray-500">
              Supported formats: JPEG, PNG, GIF
            </span>
          </div>
          <label className="cursor-pointer mt-4">
            <Button type="button" variant="outline" size="sm">
              Browse files
            </Button>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onAddImage}
              disabled={uploading}
              multiple={isOfferForm}
            />
          </label>
        </div>
        
        {/* Validation Message */}
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
