
// This component provides the interface for uploading images
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  // Determine the appropriate message based on the current state
  const getMessage = () => {
    if (isDragging) {
      return "Drop image(s) here";
    } else if (isOfferForm && hasImages) {
      return "Drag and drop more images here or click to browse";
    } else {
      return "Drag and drop image(s) here or click to browse";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="flex flex-col items-center gap-2">
        {/* Upload icon */}
        <div className={`bg-gray-200 rounded-full p-3 ${isDragging ? 'bg-blue-200' : ''}`}>
          <Upload className="h-6 w-6 text-gray-600" />
        </div>
        
        {/* Instructions text */}
        <span className="text-sm text-gray-600 text-center">
          {getMessage()}
        </span>
        
        {/* File format information */}
        <span className="text-xs text-gray-500">
          Supported formats: JPEG, PNG, GIF
        </span>
      </div>
      
      {/* File browser button */}
      <label className="cursor-pointer mt-4">
        <Button type="button" variant="outline" size="sm">
          Browse files
        </Button>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onFileSelect}
          disabled={uploading}
          multiple={multiple}
        />
      </label>
    </div>
  );
};

export default UploadArea;
