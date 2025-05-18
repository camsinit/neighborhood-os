
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "../types";

/**
 * Hook for handling NotificationsTab form logic
 * 
 * Centralizes the logic for the notifications tab in the settings form
 * 
 * @param form - The form instance from react-hook-form
 * @returns The form instance and any additional methods/data for the NotificationsTab
 */
export const useNotificationsTabForm = (form: UseFormReturn<ProfileFormValues>) => {
  // Currently a simple pass-through, but we can add more specific logic as needed
  // For example, we could add methods to toggle multiple notification settings at once
  
  return {
    form
  };
};
