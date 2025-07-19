
// Utility functions for safety update image upload operations
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Upload an image for safety updates to Supabase storage
 * 
 * This function handles file upload to the dedicated safety_images bucket,
 * generating unique filenames and providing proper error handling.
 * 
 * @param file The image file to upload
 * @param userId The ID of the user uploading the file (for organizing storage)
 * @returns The public URL of the uploaded image, or null if upload failed
 */
export const uploadSafetyImage = async (file: File, userId: string | undefined): Promise<string | null> => {
  // Validate that user is authenticated before allowing upload
  if (!userId) {
    toast.error("You must be logged in to upload images");
    return null;
  }
  
  try {
    // Generate a unique filename with the original extension
    // This prevents naming conflicts and organizes files by user
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

    console.log('[uploadSafetyImage] Starting upload:', {
      originalName: file.name,
      filePath,
      fileSize: file.size,
      fileType: file.type
    });

    // Upload the file to the safety_images bucket
    const { error: uploadError } = await supabase.storage
      .from('safety_images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('[uploadSafetyImage] Upload error:', uploadError);
      throw uploadError;
    }

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('safety_images')
      .getPublicUrl(filePath);

    console.log('[uploadSafetyImage] Upload successful:', {
      filePath,
      publicUrl
    });

    toast.success("Image uploaded successfully");
    return publicUrl;
  } catch (error) {
    console.error('[uploadSafetyImage] Error uploading image:', error);
    toast.error("Failed to upload image. Please try again.");
    return null;
  }
};

/**
 * Delete a safety update image from storage
 * 
 * This function extracts the file path from the public URL and removes
 * the file from storage, useful for cleanup when images are replaced.
 * 
 * @param imageUrl The public URL of the image to delete
 * @param userId The ID of the user (for authorization)
 * @returns Promise<boolean> indicating success/failure
 */
export const deleteSafetyImage = async (imageUrl: string, userId: string | undefined): Promise<boolean> => {
  if (!userId || !imageUrl) {
    return false;
  }

  try {
    // Extract the file path from the public URL
    // Format: https://[project].supabase.co/storage/v1/object/public/safety_images/[userId]/[filename]
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'safety_images');
    
    if (bucketIndex === -1) {
      console.warn('[deleteSafetyImage] Invalid image URL format:', imageUrl);
      return false;
    }

    // Reconstruct the file path within the bucket
    const filePath = urlParts.slice(bucketIndex + 1).join('/');
    
    console.log('[deleteSafetyImage] Attempting to delete:', {
      imageUrl,
      filePath
    });

    // Delete the file from storage
    const { error } = await supabase.storage
      .from('safety_images')
      .remove([filePath]);

    if (error) {
      console.error('[deleteSafetyImage] Delete error:', error);
      return false;
    }

    console.log('[deleteSafetyImage] Image deleted successfully:', filePath);
    return true;
  } catch (error) {
    console.error('[deleteSafetyImage] Error deleting image:', error);
    return false;
  }
};
