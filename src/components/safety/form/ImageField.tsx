
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SafetyUpdateFormData } from "../schema/safetyUpdateSchema";
import { Button } from "@/components/ui/button";
import { Image, X, Upload, Loader2 } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { uploadSafetyImage, deleteSafetyImage } from "../utils/imageUpload";

/**
 * ImageField Component
 * 
 * Handles image upload functionality for safety updates, including:
 * - File selection and preview
 * - Upload to Supabase storage
 * - Loading states during upload
 * - Image removal and cleanup
 * - Integration with react-hook-form
 */
interface ImageFieldProps {
  form: UseFormReturn<SafetyUpdateFormData>;
}

export function ImageField({ form }: ImageFieldProps) {
  // State for managing the image preview and upload process
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    form.getValues("imageUrl") || null
  );
  const [isUploading, setIsUploading] = useState(false);
  
  // Get current user for upload authorization
  const user = useUser();

  /**
   * Handle image file selection and upload
   * 
   * This function is triggered when a user selects an image file.
   * It creates a preview, uploads to storage, and updates the form.
   */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (basic client-side validation)
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (limit to 5MB for reasonable upload times)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image must be smaller than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      
      console.log('[ImageField] Starting image upload process:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Create a local preview URL for immediate user feedback
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      // Upload the image to Supabase storage
      const uploadedUrl = await uploadSafetyImage(file, user?.id);
      
      if (uploadedUrl) {
        // Update the form with the uploaded image URL
        form.setValue("imageUrl", uploadedUrl);
        
        // Clean up the local preview URL and use the uploaded URL
        URL.revokeObjectURL(localPreviewUrl);
        setPreviewUrl(uploadedUrl);
        
        console.log('[ImageField] Image upload completed successfully:', uploadedUrl);
      } else {
        // Upload failed, revert the preview
        URL.revokeObjectURL(localPreviewUrl);
        setPreviewUrl(form.getValues("imageUrl") || null);
      }
    } catch (error) {
      console.error('[ImageField] Error during image upload:', error);
      // Revert preview on error
      setPreviewUrl(form.getValues("imageUrl") || null);
    } finally {
      setIsUploading(false);
      // Clear the input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  /**
   * Remove the currently selected image
   * 
   * This function cleans up the preview, removes the image from storage
   * if it was uploaded, and clears the form field.
   */
  const removeImage = async () => {
    const currentImageUrl = form.getValues("imageUrl");
    
    // If there's an uploaded image, try to delete it from storage
    if (currentImageUrl && currentImageUrl.includes('supabase')) {
      console.log('[ImageField] Removing uploaded image:', currentImageUrl);
      await deleteSafetyImage(currentImageUrl, user?.id);
    }
    
    // Clean up preview URL if it's a blob URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Clear the form field and preview
    setPreviewUrl(null);
    form.setValue("imageUrl", "");
  };

  // Determine the current image URL (could be preview or uploaded)
  const currentImageUrl = previewUrl || form.getValues("imageUrl");

  return (
    <FormField
      control={form.control}
      name="imageUrl"
      render={() => (
        <FormItem>
          <FormLabel>Image (Optional)</FormLabel>
          <div className="space-y-4">
            {currentImageUrl ? (
              // Display selected/uploaded image with remove option
              <div className="relative">
                <img 
                  src={currentImageUrl} 
                  alt="Safety update" 
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                
                {/* Loading overlay during upload */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="flex items-center gap-2 text-white">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  </div>
                )}
                
                {/* Remove button (disabled during upload) */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // Upload area when no image is selected
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      // Loading state
                      <>
                        <Loader2 className="w-8 h-8 mb-2 text-gray-500 animate-spin" />
                        <p className="text-sm text-gray-500">Uploading image...</p>
                      </>
                    ) : (
                      // Default upload prompt
                      <>
                        <Image className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                  
                  {/* Hidden file input */}
                  <Input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
