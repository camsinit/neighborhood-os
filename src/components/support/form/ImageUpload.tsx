
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";

// Updated interface to support multiple images
interface ImageUploadProps {
  imageUrl?: string | null | undefined; // Keep for backward compatibility
  images?: string[]; // New field for multiple images
  onImageUpload: (url: string) => void; // Original handler
  onImagesUpdate?: (urls: string[]) => void; // New handler for multiple images
  category: string | undefined;
  multiple?: boolean; // Flag to enable multiple image uploads
}

const ImageUpload = ({ 
  imageUrl, 
  images = [], 
  onImageUpload, 
  onImagesUpdate,
  category,
  multiple = false 
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Function to handle single image upload (for backward compatibility)
  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('mutual_aid_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('mutual_aid_images')
        .getPublicUrl(filePath);

      onImageUpload(publicUrl);
      
      // If we also have the multiple images handler, update that too
      if (onImagesUpdate) {
        onImagesUpdate([...images, publicUrl]);
      }
      
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle multiple image uploads
  const handleMultipleImageUpload = async (files: FileList) => {
    setIsUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('mutual_aid_images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('mutual_aid_images')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Update with new images
      if (onImagesUpdate) {
        const newImages = [...images, ...uploadedUrls];
        onImagesUpdate(newImages);
      }
      
      // For backward compatibility, if only one image was uploaded,
      // also call the single image handler
      if (uploadedUrls.length === 1 && !multiple) {
        onImageUpload(uploadedUrls[0]);
      }
      
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error("Failed to upload one or more images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Function to remove an image from the list
  const handleRemoveImage = (indexToRemove: number) => {
    if (onImagesUpdate && images) {
      const newImages = images.filter((_, index) => index !== indexToRemove);
      onImagesUpdate(newImages);
    }
  };

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
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // Filter for image files only
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length === 0) {
      toast.error("Please drop image files only");
      return;
    }
    
    if (multiple) {
      handleMultipleImageUpload(
        // Convert the filtered array back to a FileList-like object
        Object.assign(
          new DataTransfer(), 
          { files: imageFiles }
        ).files
      );
    } else {
      // Just take the first image if multiple aren't allowed
      handleImageUpload(imageFiles[0]);
    }
  };

  // Only show the component for appropriate categories
  if (category !== 'goods') return null;

  return (
    <div className="space-y-4">
      <Label htmlFor="image">
        {multiple ? "Images (Upload up to 5 images)" : "Image"}
      </Label>
      
      {/* Drag and drop area */}
      <div 
        className={`border-2 border-dashed rounded-md p-6 ${
          isDragging ? 'border-primary bg-blue-50' : 'border-gray-300'
        } transition-all`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <Upload className={`h-8 w-8 mb-2 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
          <p className="text-sm text-center text-gray-600 mb-1">
            {isDragging 
              ? "Drop image(s) here" 
              : "Drag and drop image(s) here or"}
          </p>
          <div className="mt-2">
            <label htmlFor="image-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" disabled={isUploading}>
                Browse files
              </Button>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;

                  if (multiple && files.length > 1) {
                    // Handle multiple files
                    handleMultipleImageUpload(files);
                  } else {
                    // Handle single file
                    handleImageUpload(files[0]);
                  }
                }}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: JPEG, PNG, GIF
          </p>
        </div>
      </div>

      {/* Display single image preview (for backward compatibility) */}
      {!multiple && imageUrl && (
        <div className="relative w-20 h-20 mt-2">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="w-full h-full object-cover rounded-md shadow-sm"
          />
        </div>
      )}

      {/* Display multiple image previews */}
      {multiple && images && images.length > 0 && (
        <div className="mt-4">
          <Label className="mb-2 block">Uploaded Images</Label>
          <div className="flex flex-wrap gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative group w-20 h-20">
                <img 
                  src={img} 
                  alt={`Preview ${index + 1}`} 
                  className="w-full h-full object-cover rounded-md shadow-sm"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload status */}
      {isUploading && (
        <div className="text-sm text-muted-foreground">
          Uploading images, please wait...
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
