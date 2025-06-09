
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function to update a user's profile image
 * This is a one-time utility to set a specific user's avatar
 */
export const updateUserProfileImage = async (userId: string, imageUrl: string) => {
  try {
    console.log(`[updateUserProfileImage] Updating profile image for user: ${userId}`);
    console.log(`[updateUserProfileImage] Setting image URL to: ${imageUrl}`);
    
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

    // Update the user's avatar_url in the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: imageUrl,
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

    return true;
  } catch (error) {
    console.error('[updateUserProfileImage] Failed to update profile image:', error);
    return false;
  }
};

// Manual execution function for testing
export const executeUpdate = async () => {
  console.log('[executeUpdate] Starting manual profile image update...');
  
  const targetUserId = '2fe44a85-1ab2-4811-acbc-97b64e9af522';
  const imageUrl = '/lovable-uploads/e328160f-76a0-4b88-9dce-4db8edb012d8.png';
  
  const result = await updateUserProfileImage(targetUserId, imageUrl);
  
  if (result) {
    console.log('[executeUpdate] ✅ Profile image updated successfully!');
    alert('Profile image updated successfully! Please refresh the page to see changes.');
  } else {
    console.error('[executeUpdate] ❌ Failed to update profile image');
    alert('Failed to update profile image. Check console for errors.');
  }
  
  return result;
};

// Execute immediately when this file is imported
console.log('[updateProfileImage] Module loaded, executing update...');
executeUpdate();
