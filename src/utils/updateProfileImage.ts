
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function to update a user's profile image
 * This is a one-time utility to set a specific user's avatar
 */
export const updateUserProfileImage = async (userId: string, imageUrl: string) => {
  try {
    console.log(`[updateUserProfileImage] Updating profile image for user: ${userId}`);
    
    // Update the user's avatar_url in the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('[updateUserProfileImage] Error updating profile image:', error);
      throw error;
    }

    console.log(`[updateUserProfileImage] Successfully updated profile image for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('[updateUserProfileImage] Failed to update profile image:', error);
    return false;
  }
};

// Execute the update for the specific user
const targetUserId = '2fe44a85-1ab2-4811-acbc-97b64e9af522';
const imageUrl = '/lovable-uploads/e328160f-76a0-4b88-9dce-4db8edb012d8.png';

// Run the update immediately when this file is imported
updateUserProfileImage(targetUserId, imageUrl)
  .then((success) => {
    if (success) {
      console.log('Profile image updated successfully!');
    } else {
      console.error('Failed to update profile image');
    }
  })
  .catch((error) => {
    console.error('Error during profile image update:', error);
  });
