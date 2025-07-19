import { useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

/**
 * Simple Form Hook
 * 
 * Provides standardized form submission handling with simple loading → success/error states.
 * Replaces complex progress tracking with clean, predictable state management.
 */

interface UseSimpleFormOptions {
  onSuccess?: (data?: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface UseSimpleFormReturn {
  isLoading: boolean;
  isSubmitting: boolean; // Alias for backwards compatibility
  error: string | null;
  submitForm: (submitFn: () => Promise<any>) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for handling form submissions with standardized loading and error states
 * 
 * @param options - Configuration options for success/error handling
 * @returns Form state and submission methods
 * 
 * @example
 * ```tsx
 * const { isLoading, submitForm } = useSimpleForm({
 *   onSuccess: () => navigate('/success'),
 *   successMessage: "Profile updated successfully!"
 * });
 * 
 * const handleSubmit = (formData) => {
 *   submitForm(async () => {
 *     return await updateProfile(formData);
 *   });
 * };
 * ```
 */
export const useSimpleForm = (options: UseSimpleFormOptions = {}): UseSimpleFormReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    onSuccess,
    onError,
    successMessage = "Operation completed successfully",
    errorMessage = "Something went wrong. Please try again."
  } = options;

  /**
   * Submit a form with standardized error handling and toast notifications
   * 
   * @param submitFn - Async function that performs the actual submission
   */
  const submitForm = async (submitFn: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Execute the provided submission function
      const result = await submitFn();
      
      // Show success message
      showSuccessToast(successMessage);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (err: any) {
      // Extract error message
      const errorMsg = err?.message || err?.error?.message || errorMessage;
      setError(errorMsg);
      
      // Show error toast
      showErrorToast("Error", errorMsg);
      
      // Call error callback if provided
      if (onError) {
        onError(err);
      }
      
      // Log error for debugging
      console.error('[useSimpleForm] Submission error:', err);
      
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset form state to initial values
   */
  const reset = () => {
    setIsLoading(false);
    setError(null);
  };

  return {
    isLoading,
    isSubmitting: isLoading, // Alias for backwards compatibility
    error,
    submitForm,
    reset
  };
};