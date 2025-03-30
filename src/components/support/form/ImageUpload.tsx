
import { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { SupportRequestFormData } from "../types/formTypes";

/**
 * ImageUpload component for support request forms
 * 
 * Handles single or multiple image uploads for support requests
 */
interface ImageUploadProps {
  form: UseFormReturn<SupportRequestFormData>;
  multiple?: boolean;
}

const ImageUpload = ({ form, multiple = false }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  // Mock function for image upload - in a real application, this would upload to storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, we would upload the file and get the URL
      // For now, we'll just use a placeholder
      if (multiple) {
        // For multiple images
        const currentImages = form.getValues('images') || [];
        const newImages = [...currentImages];
        
        for (let i = 0; i < files.length; i++) {
          newImages.push(`https://placekitten.com/400/${300 + i}`);
        }
        
        form.setValue('images', newImages);
      } else {
        // For single image
        form.setValue('imageUrl', 'https://placekitten.com/400/300');
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  // Remove an image from the array
  const removeImage = (index: number) => {
    const currentImages = form.getValues('images') || [];
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    form.setValue('images', newImages);
  };

  // Clear the single image
  const clearImage = () => {
    form.setValue('imageUrl', '');
  };

  return (
    <>
      {multiple ? (
        // Multiple image upload for goods
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Image previews */}
                  {field.value && field.value.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {field.value.map((url, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={url} 
                            alt={`Preview ${index}`} 
                            className="h-32 w-full object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload button */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple={true}
                        accept="image/*"
                        onChange={handleImageUpload} 
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        // Single image upload
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Image preview */}
                  {field.value && (
                    <div className="relative w-full">
                      <img 
                        src={field.value} 
                        alt="Preview" 
                        className="h-48 w-full object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={clearImage}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Upload button - only show if no image */}
                  {!field.value && (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload} 
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default ImageUpload;
