
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@supabase/auth-helpers-react";
import { Shield } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSafetyUpdateFormSubmit } from "./hooks/useSafetyUpdateFormSubmit";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { SafetyTypeField } from "./form/SafetyTypeField";
import { SafetyTextField } from "./form/SafetyTextField";
import { safetyUpdateSchema, SafetyUpdateFormData } from "./schema/safetyUpdateSchema";

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
 * This refactored component uses a more modular approach with separated form fields
 * and a dedicated submission hook for better maintainability.
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
  const { toast } = useToast();
  const user = useUser();
  const neighborhood = useCurrentNeighborhood();
  const queryClient = useQueryClient();
  
  // Custom hook for form submission
  const { isSubmitting, submitSafetyUpdate } = useSafetyUpdateFormSubmit(
    user,
    neighborhood,
    () => {
      if (onSuccess) onSuccess();
    },
    existingData?.id ? 'edit' : 'create',
    existingData?.id
  );

  // Function to handle the form submission
  const onSubmit = async (values: SafetyUpdateFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a safety update.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await submitSafetyUpdate(values);
      
      if (success) {
        // Invalidate related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["safety-updates"] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });
        
        toast({
          title: "Success!",
          description: existingData?.id
            ? "Safety update has been edited."
            : "New safety update has been created.",
        });
        
        // Reset the form if not editing
        if (!existingData?.id) {
          form.reset({
            title: "",
            description: "",
            type: "General",
          });
        }
      }
    } catch (err) {
      console.error("Error submitting safety update:", err);
      toast({
        title: "Error",
        description: "There was a problem submitting your safety update.",
        variant: "destructive",
      });
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
          disabled={isSubmitting}
        >
          <Shield className="w-4 h-4 mr-2" />
          {isSubmitting 
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
