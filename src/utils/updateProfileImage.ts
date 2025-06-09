
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function to update a user's profile image
 * This properly uploads the image to Supabase Storage and updates the profile
 */
export const updateUserProfileImage = async (userId: string, localImagePath: string) => {
  try {
    console.log(`[updateUserProfileImage] Updating profile image for user: ${userId}`);
    console.log(`[updateUserProfileImage] Local image path: ${localImagePath}`);
    
    // First, let's check if the user exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('[updateUserProfileImage] Error fetching user profile:', fetchError);
      throw fetchError;
    }

    console.log('[updateUserProfileImage] Current profile data:', existingProfile);

    // Fetch the image from the local path
    const response = await fetch(localImagePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const imageBlob = await response.blob();
    console.log('[updateUserProfileImage] Image blob size:', imageBlob.size, 'bytes');

    // Create a unique filename for the image
    const fileExtension = localImagePath.split('.').pop() || 'png';
    const fileName = `${userId}-${Date.now()}.${fileExtension}`;
    
    console.log('[updateUserProfileImage] Uploading to Storage with filename:', fileName);

    // Upload to Supabase Storage avatars bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, imageBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[updateUserProfileImage] Error uploading to storage:', uploadError);
      throw uploadError;
    }

    console.log('[updateUserProfileImage] Upload successful:', uploadData);

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('[updateUserProfileImage] Generated public URL:', publicUrl);

    // Update the user's avatar_url in the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('[updateUserProfileImage] Error updating profile image:', error);
      throw error;
    }

    console.log(`[updateUserProfileImage] Successfully updated profile image. New data:`, data);
    
    // Verify the update worked
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error('[updateUserProfileImage] Error verifying update:', verifyError);
    } else {
      console.log('[updateUserProfileImage] Verification - updated profile:', verifyData);
    }

    return publicUrl;
  } catch (error) {
    console.error('[updateUserProfileImage] Failed to update profile image:', error);
    throw error;
  }
};

// Manual execution function for testing
export const executeUpdate = async () => {
  console.log('[executeUpdate] Starting manual profile image update...');
  
  const targetUserId = '2fe44a85-1ab2-4811-acbc-97b64e9af522';
  const localImagePath = '/lovable-uploads/e328160f-76a0-4b88-9dce-4db8edb012d8.png';
  
  try {
    const newImageUrl = await updateUserProfileImage(targetUserId, localImagePath);
    console.log('[executeUpdate] ✅ Profile image updated successfully!');
    console.log('[executeUpdate] New image URL:', newImageUrl);
    alert(`Profile image updated successfully!\nNew URL: ${newImageUrl}\nPlease refresh the page to see changes.`);
    return newImageUrl;
  } catch (error) {
    console.error('[executeUpdate] ❌ Failed to update profile image:', error);
    alert(`Failed to update profile image: ${error.message}`);
    return null;
  }
};

// Execute immediately when this file is imported
console.log('[updateProfileImage] Module loaded, executing update...');
executeUpdate();
