
// This utility file handles image upload and management
import { uploadImage } from "./imageUpload";
import { toast } from "sonner";

/**
 * Upload an image file and get the URL
 * Only shows toast for critical errors, not for success
 * 
 * @param file The file to upload
 * @param userId The ID of the user uploading the file
 * @returns The URL of the uploaded image, or null if upload failed
 */
export const handleImageUpload = async (file: File, userId: string | undefined) => {
  // Critical validation that requires user notification
  if (!userId) {
    toast.error("You must be logged in to upload images");
    return null;
  }
  
  try {
    const imageUrl = await uploadImage(file, userId);
    return imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error("Failed to upload image. Please try again.");
    return null;
  }
};

/**
 * Process a file input change event for image uploads
 * Returns validation errors for inline display instead of toasts
 * 
 * @param e The change event from the file input
 * @param userId The ID of the user uploading the file
 * @returns Object with imageUrl and optional error message
 */
export const processFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, userId: string | undefined) => {
  const file = e.target.files?.[0];
  if (!file) return { imageUrl: null, error: null };
  
  // Return validation error instead of showing toast
  if (!file.type.startsWith('image/')) {
    return { 
      imageUrl: null, 
      error: `File "${file.name}" is not an image. Please select an image file.` 
    };
  }
  
  // Upload the image without showing loading toast
  const imageUrl = await handleImageUpload(file, userId);
  
  return { imageUrl, error: null };
};

/**
 * Process multiple file uploads
 * Returns results with any validation errors for inline display
 * 
 * @param e The change event from the file input
 * @param userId The ID of the user uploading the files
 * @returns Object with uploaded URLs and any error messages
 */
export const processMultipleFileUploads = async (e: React.ChangeEvent<HTMLInputElement>, userId: string | undefined) => {
  const files = e.target.files;
  if (!files || files.length === 0) return { imageUrls: [], error: null };
  
  // Filter for image files only
  const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
  const nonImageFiles = Array.from(files).filter(file => !file.type.startsWith('image/'));
  
  if (imageFiles.length === 0) {
    return { 
      imageUrls: [], 
      error: "Please select image files only" 
    };
  }
  
  // Upload all images in parallel without loading toast
  const uploadPromises = imageFiles.map(file => handleImageUpload(file, userId));
  const results = await Promise.all(uploadPromises);
  
  // Filter out any null results (failed uploads)
  const successfulUrls = results.filter(url => url !== null) as string[];
  
  // Return results with optional warning about non-image files
  const error = nonImageFiles.length > 0 
    ? `${nonImageFiles.length} non-image file(s) were skipped`
    : null;
  
  return { imageUrls: successfulUrls, error };
};
