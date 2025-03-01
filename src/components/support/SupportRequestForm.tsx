
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useSupportRequestSubmit } from "@/hooks/support/useSupportRequestSubmit";
import FormFields from "./form/FormFields";
import ImageUpload from "./form/ImageUpload";
import { SupportRequestFormProps, SupportRequestFormData } from "./types/formTypes";

/**
 * SupportRequestForm component for creating and editing support requests
 * 
 * This form is used across different categories (care, goods, skills) and 
 * handles both creation and editing of support requests
 */
const SupportRequestForm = ({ 
  onClose, 
  initialValues,
  mode = 'create',
  requestId,
  initialRequestType
}: SupportRequestFormProps) => {
  // Initialize form data with initial values or defaults
  const [formData, setFormData] = useState<Partial<SupportRequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    category: initialValues?.category || "",
    requestType: initialValues?.requestType || initialRequestType || null,
    validUntil: initialValues?.validUntil?.split('T')[0] || "",
    supportType: initialValues?.supportType || "immediate",
    imageUrl: initialValues?.imageUrl || "",
    // Add support for multiple images
    images: initialValues?.images || [],
  });

  // Log form data changes for debugging
  useEffect(() => {
    console.log("SupportRequestForm formData:", formData);
  }, [formData]);

  // Get submission handlers from the custom hook
  const { handleSubmit, handleUpdate } = useSupportRequestSubmit({
    onSuccess: () => {
      onClose();
      if (mode === 'create') {
        setFormData({});
      }
    }
  });

  /**
   * Handle changes to form fields
   * @param field - The field name to update
   * @param value - The new value for the field
   */
  const handleFieldChange = (field: keyof SupportRequestFormData, value: any) => {
    console.log(`Field change: ${field}=${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handle form submission
   * @param e - Form submission event
   */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form:", formData);
    
    if (!formData.requestType) {
      console.error("Missing requestType, cannot submit");
      return;
    }
    
    // Call the appropriate handler based on mode
    if (mode === 'edit' && requestId) {
      console.log(`Updating request ${requestId}`);
      handleUpdate(requestId, formData);
    } else {
      console.log("Creating new request");
      handleSubmit(formData);
    }
  };

  // Determine if we should use multiple images upload
  const shouldUseMultipleImages = formData.category === 'goods';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormFields 
        formData={formData}
        onChange={handleFieldChange}
      />

      <ImageUpload
        imageUrl={formData.imageUrl}
        images={formData.images}
        onImageUpload={(url) => handleFieldChange('imageUrl', url)}
        onImagesUpdate={(urls) => handleFieldChange('images', urls)}
        category={formData.category}
        multiple={shouldUseMultipleImages}
      />

      <DialogFooter>
        <Button type="submit">
          {mode === 'edit' ? 'Update Request' : 'Create Request'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SupportRequestForm;
