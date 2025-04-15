
// This component provides the interface for uploading images
import { Loader2, Upload } from "lucide-react";
import { useRef } from "react";

// Props for the UploadArea component
interface UploadAreaProps {
  isDragging: boolean;
  isOfferForm: boolean;
  hasImages: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  multiple?: boolean;
}

/**
 * UploadArea component
 * 
 * Provides a drag-and-drop zone and file browser button for image uploads.
 * Displays different messages based on the form type and current state.
 */
const UploadArea = ({ 
  isDragging,
  isOfferForm,
  hasImages,
  onFileSelect,
  uploading,
  multiple = false
}: UploadAreaProps) => {
  // Create a reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Determine the appropriate message based on the current state
  const getMessage = () => {
    // If we're currently uploading an image, show a loading message
    if (uploading) {
      return "Uploading image...";
    }
    // If the user is dragging a file over the area
    else if (isDragging) {
      return "Drop image(s) here";
    } 
    // If this is an offer form and we already have some images
    else if (isOfferForm && hasImages) {
      return "Drag and drop more images here or click to browse";
    } 
    // Default message
    else {
      return "Drag and drop image(s) here or click to browse";
    }
  };

  // Handle clicks on the upload area - trigger the hidden file input
  const handleAreaClick = () => {
    // Don't allow clicks while uploading
    if (uploading) return;
    
    // Trigger the file input click programmatically
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    // Make the entire area clickable to open file browser
    <div 
      className="flex flex-col items-center justify-center py-6 cursor-pointer"
      onClick={handleAreaClick}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Upload icon or loading spinner */}
        <div className={`bg-gray-200 rounded-full p-3 ${isDragging ? 'bg-blue-200' : ''} ${uploading ? 'bg-blue-100' : ''}`}>
          {uploading ? (
            // Show a spinning loader when uploading
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          ) : (
            // Otherwise show the upload icon
            <Upload className="h-6 w-6 text-gray-600" />
          )}
        </div>
        
        {/* Instructions text - changes based on state */}
        <span className="text-sm text-gray-600 text-center">
          {getMessage()}
        </span>
        
        {/* File format information */}
        <span className="text-xs text-gray-500">
          Supported formats: JPEG, PNG, GIF
        </span>
      </div>
      
      {/* Hidden file input - connected to our ref for programmatic clicking */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={onFileSelect}
        disabled={uploading}
        multiple={multiple}
        id="file-upload-input"
      />
    </div>
  );
};

export default UploadArea;
