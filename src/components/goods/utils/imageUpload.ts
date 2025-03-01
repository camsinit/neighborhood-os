
// Utility functions for image upload operations
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Upload an image to Supabase storage
 * 
 * @param file The file to upload
 * @param userId The ID of the user uploading the file
 * @returns The public URL of the uploaded image, or null if upload failed
 */
export const uploadImage = async (file: File, userId: string | undefined): Promise<string | null> => {
  if (!userId) {
    toast.error("You must be logged in to upload images");
    return null;
  }
  
  try {
    // Generate a unique filename with the original extension
    const fileExt = file.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    // Upload the file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('mutual_aid_images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('mutual_aid_images')
      .getPublicUrl(filePath);

    toast.success("Image uploaded successfully");
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error("Failed to upload image. Please try again.");
    return null;
  }
};
