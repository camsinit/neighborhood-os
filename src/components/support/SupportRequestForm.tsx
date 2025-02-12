
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useSupportRequestSubmit } from "@/hooks/support/useSupportRequestSubmit";
import FormFields from "./form/FormFields";
import ImageUpload from "./form/ImageUpload";
import { SupportRequestFormProps, SupportRequestFormData } from "./types/formTypes";

const SupportRequestForm = ({ 
  onClose, 
  initialValues,
  mode = 'create',
  requestId
}: SupportRequestFormProps) => {
  const [formData, setFormData] = useState<Partial<SupportRequestFormData>>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    category: initialValues?.category || "",
    requestType: initialValues?.requestType || null,
    validUntil: initialValues?.validUntil?.split('T')[0] || "",
    supportType: initialValues?.supportType || "immediate",
    imageUrl: initialValues?.imageUrl || "",
  });

  const { handleSubmit, handleUpdate } = useSupportRequestSubmit({
    onSuccess: () => {
      onClose();
      if (mode === 'create') {
        setFormData({});
      }
    }
  });

  const handleFieldChange = (field: keyof SupportRequestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requestType) return;
    
    if (mode === 'edit' && requestId) {
      handleUpdate(requestId, formData);
    } else {
      handleSubmit(formData);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormFields 
        formData={formData}
        onChange={handleFieldChange}
      />

      <ImageUpload
        imageUrl={formData.imageUrl}
        onImageUpload={(url) => handleFieldChange('imageUrl', url)}
        category={formData.category}
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
