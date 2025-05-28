
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SafetyTextField } from "./form/SafetyTextField";
import { SafetyTypeField } from "./form/SafetyTypeField";
import { ImageField } from "./form/ImageField";
import { safetyUpdateSchema, SafetyUpdateFormData } from "./schema/safetyUpdateSchema";
import { useSafetyUpdateSubmit } from "@/hooks/safety/useSafetyUpdateSubmit";

// Updated interface to support both create and edit operations
interface SafetyUpdateFormProps {
  onSuccess?: () => void;
  existingData?: SafetyUpdateFormData;
  updateId?: string; // If provided, this is an edit operation
}

/**
 * Form component for creating and editing safety updates
 * Automatically detects edit mode when updateId is provided
 * Uses cleaned-up database triggers that prevent duplicate activities
 */
export default function SafetyUpdateForm({ onSuccess, existingData, updateId }: SafetyUpdateFormProps) {
  // Set up the form with validation schema and default values
  const form = useForm<SafetyUpdateFormData>({
    resolver: zodResolver(safetyUpdateSchema),
    defaultValues: {
      title: existingData?.title || "",
      description: existingData?.description || "",
      type: existingData?.type || "Emergency", // Set Emergency as default to test the triggers
      imageUrl: existingData?.imageUrl || "",
    },
  });

  // Use the refactored safety update submission hook with cleaned database trigger logic
  const { submitSafetyUpdate, handleUpdate, isLoading } = useSafetyUpdateSubmit({
    onSuccess: () => {
      // Call the success callback if provided
      if (onSuccess) onSuccess();
      // Reset the form after successful submission (only for new updates)
      if (!updateId) {
        form.reset();
      }
    }
  });

  // Handle form submission - automatically choose create or update based on updateId
  const onSubmit = async (data: SafetyUpdateFormData) => {
    console.log('[SafetyUpdateForm] Submitting safety update:', { isEdit: !!updateId, updateId, data });
    
    if (updateId) {
      // This is an edit operation
      await handleUpdate(updateId, data);
    } else {
      // This is a create operation
      await submitSafetyUpdate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Safety type selection - this determines the urgency and notification behavior */}
        <SafetyTypeField form={form} />
        
        {/* Title field - required for all safety updates */}
        <SafetyTextField
          form={form}
          name="title"
          label="Title"
          placeholder="Enter a title for your safety update"
        />
        
        {/* Description field - optional but recommended for context */}
        <SafetyTextField
          form={form}
          name="description"
          label="Description"
          placeholder="Provide details about the safety update"
          multiline={true}
        />
        
        {/* Optional image upload */}
        <ImageField form={form} />
        
        {/* Submit button with loading state - text changes based on operation type */}
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading 
            ? (updateId ? "Updating..." : "Submitting...") 
            : (updateId ? "Update Safety Update" : "Post Safety Update")
          }
        </Button>
      </form>
    </Form>
  );
}
