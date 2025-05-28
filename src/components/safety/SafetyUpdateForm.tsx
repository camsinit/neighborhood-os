
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SafetyTextField } from "./form/SafetyTextField";
import { SafetyTypeField } from "./form/SafetyTypeField";
import { ImageField } from "./form/ImageField";
import { safetyUpdateSchema, SafetyUpdateFormData } from "./schema/safetyUpdateSchema";
import { useSafetyUpdateSubmit } from "@/hooks/safety/useSafetyUpdateSubmit";

interface SafetyUpdateFormNewProps {
  onSuccess?: () => void;
  existingData?: SafetyUpdateFormData;
}

/**
 * Form component for creating and editing safety updates
 * Now uses database triggers that prevent duplicate activities
 */
export default function SafetyUpdateFormNew({ onSuccess, existingData }: SafetyUpdateFormNewProps) {
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

  // Use the safety update submission hook with database trigger logic
  const { submitSafetyUpdate, isLoading } = useSafetyUpdateSubmit({
    onSuccess: () => {
      // Call the success callback if provided
      if (onSuccess) onSuccess();
      // Reset the form after successful submission
      form.reset();
    }
  });

  // Handle form submission - database triggers handle activities/notifications automatically
  const onSubmit = async (data: SafetyUpdateFormData) => {
    console.log('[SafetyUpdateFormNew] Submitting safety update with database triggers:', data);
    await submitSafetyUpdate(data);
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
        
        {/* Submit button with loading state */}
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? "Submitting..." : "Post Safety Update"}
        </Button>
      </form>
    </Form>
  );
}
