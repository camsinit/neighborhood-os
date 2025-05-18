
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
  // Currently a simple pass-through, but can add more specific logic as needed
  // For example: field-specific validation, transformations, etc.
  
  return {
    form
  };
};
