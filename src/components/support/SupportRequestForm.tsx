
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useUser } from "@supabase/auth-helpers-react";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import FormFields from "./form/FormFields";
import ImageUpload from "./form/ImageUpload";
import { SupportRequestFormProps, SupportRequestFormData, supportRequestSchema } from "./types/formTypes";
import { useSupportRequestFormSubmit } from "./hooks/useSupportRequestFormSubmit";

/**
 * SupportRequestForm component
 * 
 * This refactored component uses the same pattern as the care request form,
 * with a form hook and separated components for better maintainability
 */
const SupportRequestForm = ({ 
  onClose, 
  initialValues = {},
  mode = 'create',
  requestId,
  initialRequestType
}: SupportRequestFormProps) => {
  // Get the current user and neighborhood
  const user = useUser();
  const neighborhoodData = useCurrentNeighborhood();
  
  // Set up the submission hook
  const { isSubmitting, submitSupportRequest } = useSupportRequestFormSubmit(
    user,
    neighborhoodData,
    onClose,
    mode,
    requestId
  );

  // Set up default values for the form
  const defaultValues: Partial<SupportRequestFormData> = {
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    category: initialValues?.category || "",
    requestType: initialValues?.requestType || initialRequestType || "need",
    validUntil: initialValues?.validUntil || new Date().toISOString().split('T')[0],
    supportType: initialValues?.supportType || "immediate",
    imageUrl: initialValues?.imageUrl || "",
    images: initialValues?.images || [],
    care_category: initialValues?.care_category,
    goods_category: initialValues?.goods_category,
    urgency: initialValues?.urgency,
    skill_category: initialValues?.skill_category,
  };

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<SupportRequestFormData>({
    resolver: zodResolver(supportRequestSchema),
    defaultValues,
  });

  // Determine if we should use multiple images upload
  const shouldUseMultipleImages = form.watch('category') === 'goods';

  // Handle form submission
  const onSubmit = (data: SupportRequestFormData) => {
    submitSupportRequest(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormFields form={form} />
        
        <ImageUpload
          form={form}
          multiple={shouldUseMultipleImages}
        />

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? "Saving..." 
              : mode === 'edit' 
                ? "Update Request" 
                : "Create Request"
            }
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default SupportRequestForm;
