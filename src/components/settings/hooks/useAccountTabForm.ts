
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "../types";

/**
 * Hook for handling AccountTab form logic
 * 
 * Centralizes the logic for the account tab in the settings form
 * Currently a simple extraction, but allows for future expansion of functionality
 * 
 * @param form - The form instance from react-hook-form
 * @returns The processed form instance and any additional helpers
 */
export const useAccountTabForm = (form: UseFormReturn<ProfileFormValues>) => {
  // Tracks if profile image is being uploaded
  const [imageUploading, setImageUploading] = useState(false);
  
  /**
   * Handle image upload state changes
   * This is used by the ProfileImageUpload component
   * 
   * @param uploading - Whether an image is currently uploading
   */
  const handleImageUploadState = (uploading: boolean) => {
    setImageUploading(uploading);
  };
  
  return {
    form,
    imageUploading,
    handleImageUploadState
  };
};
