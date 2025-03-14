
// This utility file handles image upload and management
import { uploadImage } from "./imageUpload";
import { toast } from "sonner";

/**
 * Upload an image file and get the URL
 * 
 * @param file The file to upload
 * @param userId The ID of the user uploading the file
 * @returns The URL of the uploaded image, or null if upload failed
 */
export const handleImageUpload = async (file: File, userId: string | undefined) => {
  // Check if user is logged in
  if (!userId) {
    toast.error("You must be logged in to upload images");
    return null;
  }
  
  try {
    // Use the existing uploadImage function from imageUpload.ts
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
 * 
 * @param e The change event from the file input
 * @param userId The ID of the user uploading the file
 * @returns The URL of the uploaded image, or null if upload failed
 */
export const processFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, userId: string | undefined) => {
  // Get the first file from the input
  const file = e.target.files?.[0];
  if (!file) return null;
  
  // Basic validation
  if (!file.type.startsWith('image/')) {
    toast.error(`File "${file.name}" is not an image`);
    return null;
  }
  
  // Show a toast notification to indicate upload has started
  const loadingToast = toast.loading("Uploading image...");
  
  // Upload the image
  const result = await handleImageUpload(file, userId);
  
  // Dismiss the loading toast and show success or failure
  toast.dismiss(loadingToast);
  // Don't show the "Image uploaded successfully" toast - we'll only show one final success message
  // when the entire form is submitted
  
  return result;
};

/**
 * Process multiple file uploads
 * 
 * @param e The change event from the file input
 * @param userId The ID of the user uploading the files
 * @returns Array of uploaded image URLs, or empty array if uploads failed
 */
export const processMultipleFileUploads = async (e: React.ChangeEvent<HTMLInputElement>, userId: string | undefined) => {
  const files = e.target.files;
  if (!files || files.length === 0) return [];
  
  // Filter for image files only
  const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
  
  if (imageFiles.length === 0) {
    toast.error("Please select image files only");
    return [];
  }
  
  // Show a loading toast with the number of files
  const loadingToast = toast.loading(`Uploading ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}...`);
  
  // Upload all images in parallel
  const uploadPromises = imageFiles.map(file => handleImageUpload(file, userId));
  const results = await Promise.all(uploadPromises);
  
  // Dismiss the loading toast and show success
  toast.dismiss(loadingToast);
  // Don't show success message for image uploads - we'll only show one final success message
  // when the entire form is submitted
  
  // Filter out any null results (failed uploads)
  return results.filter(url => url !== null) as string[];
};

