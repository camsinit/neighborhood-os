
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUser } from "@supabase/auth-helpers-react";
import { Shield } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { SafetyTypeField } from "./form/SafetyTypeField";
import { SafetyTextField } from "./form/SafetyTextField";
import { safetyUpdateSchema, SafetyUpdateFormData } from "./schema/safetyUpdateSchema";
import { useSafetyUpdateSubmit } from "@/hooks/safety/useSafetyUpdateSubmit";
import { toast } from "sonner";

/**
 * Props for the SafetyUpdateFormNew component
 */
export interface SafetyUpdateFormNewProps {
  onSuccess?: () => void;
  existingData?: any;
}

/**
 * SafetyUpdateFormNew component
 * 
 * Refactored component that uses our standardized submission hook pattern
 * for consistent form behavior across the application.
 */
export default function SafetyUpdateFormNew({ onSuccess, existingData }: SafetyUpdateFormNewProps) {
  // Set up form with validation
  const form = useForm<SafetyUpdateFormData>({
    resolver: zodResolver(safetyUpdateSchema),
    defaultValues: {
      title: existingData?.title || "",
      description: existingData?.description || "",
      type: existingData?.type || "General",
    },
  });

  // Hooks
  const user = useUser();
  const neighborhood = useCurrentNeighborhood();
  const queryClient = useQueryClient();
  
  // Use our submission hook with the success callback
  const { submitSafetyUpdate, isLoading } = useSafetyUpdateSubmit({
    onSuccess: () => {
      if (onSuccess) onSuccess();
    }
  });

  // Function to handle the form submission
  const onSubmit = async (values: SafetyUpdateFormData) => {
    // Basic validation checks
    if (!user) {
      toast.error("You must be logged in to create a safety update.");
      return;
    }

    if (!neighborhood) {
      toast.error("You must be part of a neighborhood to create a safety update.");
      return;
    }

    try {
      // Add the ID to the form data if we're editing
      const formData = existingData?.id 
        ? { ...values, id: existingData.id }
        : values;
        
      // Submit the update using our hook
      await submitSafetyUpdate(formData);
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["safety-updates"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      
      // Reset the form if not editing
      if (!existingData?.id) {
        form.reset({
          title: "",
          description: "",
          type: "General",
        });
      }
    } catch (err) {
      console.error("Error submitting safety update:", err);
      toast.error("There was a problem submitting your safety update.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Type Selection (Alert, Maintenance, General) */}
        <SafetyTypeField form={form} />

        {/* Title Input */}
        <SafetyTextField
          form={form}
          name="title"
          label="Title"
          placeholder="Enter a title"
        />

        {/* Description Textarea */}
        <SafetyTextField
          form={form}
          name="description"
          label="Description"
          placeholder="Provide details about the safety update"
          multiline={true}
        />

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full bg-red-500 hover:bg-red-600 text-white"
          disabled={isLoading}
        >
          <Shield className="w-4 h-4 mr-2" />
          {isLoading 
            ? "Submitting..." 
            : existingData?.id 
              ? "Update Safety Information" 
              : "Post Safety Update"
          }
        </Button>
      </form>
    </Form>
  );
}
