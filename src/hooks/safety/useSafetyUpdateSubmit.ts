
import { SafetyUpdateFormData } from "@/components/safety/schema/safetyUpdateSchema";
import { useSafetyUpdateCreate } from "./useSafetyUpdateCreate";
import { useSafetyUpdateEdit } from "./useSafetyUpdateEdit";

// Interface for the hook properties - supports both old and new usage patterns
interface SafetyUpdateSubmitProps {
  onSuccess?: () => void;
  onClose?: () => void; // Added for backward compatibility
}

/**
 * UNIFIED Custom hook for handling safety update submissions
 * 
 * This is a clean wrapper that delegates to specialized hooks for create and edit operations.
 * It maintains backward compatibility while using the new cleaned-up database triggers.
 */
export const useSafetyUpdateSubmit = (props?: SafetyUpdateSubmitProps) => {
  // Get the success callback, preferring onSuccess over onClose for backward compatibility
  const successCallback = props?.onSuccess || props?.onClose;
  
  // Use the specialized hooks for create and edit operations
  const { createSafetyUpdate, isLoading: isCreating, error: createError } = useSafetyUpdateCreate(successCallback);
  const { updateSafetyUpdate, isLoading: isUpdating, error: updateError } = useSafetyUpdateEdit(successCallback);

  // Unified loading state
  const isLoading = isCreating || isUpdating;
  const isSubmitting = isLoading; // Alias for backward compatibility
  
  // Unified error state
  const error = createError || updateError;

  /**
   * Create a new safety update (legacy method name for backward compatibility)
   */
  const handleSubmit = createSafetyUpdate;

  /**
   * Update an existing safety update (legacy method name for backward compatibility)
   */
  const handleUpdate = updateSafetyUpdate;

  /**
   * Unified method that works for both create and update operations
   * Provides backward compatibility for both hook interfaces
   */
  const submitSafetyUpdate = (data: SafetyUpdateFormData & { id?: string }) => {
    if (data.id) {
      return handleUpdate(data.id, data);
    } else {
      return handleSubmit(data);
    }
  };

  // Return both old and new interface properties for maximum compatibility
  return { 
    handleSubmit, 
    handleUpdate, 
    submitSafetyUpdate, 
    isLoading, 
    isSubmitting, // Alias for backward compatibility
    error 
  };
};
