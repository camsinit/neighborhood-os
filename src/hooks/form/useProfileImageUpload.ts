
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling profile image uploads to Supabase storage
 */
export const useProfileImageUpload = () => {
  /**
   * Upload profile image to Supabase storage
   */
  const uploadProfileImage = async (imageFile: File, userId: string): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      // Generate unique filename with user ID
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload to avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error('Failed to upload profile image');
    }
  };

  return { uploadProfileImage };
};
