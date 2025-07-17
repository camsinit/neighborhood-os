
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

  /**
   * Download and upload OAuth profile image to Supabase storage
   */
  const downloadAndUploadOAuthImage = async (imageUrl: string, userId: string): Promise<string | null> => {
    if (!imageUrl) return null;

    try {
      console.log('[useProfileImageUpload] Downloading OAuth image:', imageUrl);
      
      // Download the image from the OAuth provider
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const blob = await response.blob();
      const file = new File([blob], `oauth-avatar-${userId}.jpg`, { type: 'image/jpeg' });

      // Upload to our storage
      const uploadedUrl = await uploadProfileImage(file, userId);
      console.log('[useProfileImageUpload] OAuth image uploaded successfully:', uploadedUrl);
      
      return uploadedUrl;
    } catch (error) {
      console.error('[useProfileImageUpload] Error downloading/uploading OAuth image:', error);
      // Return original URL as fallback
      return imageUrl;
    }
  };

  return { uploadProfileImage, downloadAndUploadOAuthImage };
};
