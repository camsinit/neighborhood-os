
import { TitleField } from "./TitleField";
import { DescriptionField } from "./DescriptionField";
import { CareCategoryField } from "./CareCategoryField";
import { ValidUntilField } from "./ValidUntilField";
import { FormButtons } from "./FormButtons";
import { UseFormReturn } from "react-hook-form";
import { CareRequestFormData } from "../schemas/careRequestSchema";

interface CareRequestFormFieldsProps {
  form: UseFormReturn<CareRequestFormData>;
  onClose: () => void;
  isSubmitting: boolean;
  editMode?: boolean;
  onDelete?: () => void;
}

export const CareRequestFormFields = ({
  form,
  onClose,
  isSubmitting,
  editMode = false,
  onDelete
}: CareRequestFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <TitleField form={form} />
      <DescriptionField form={form} />
      <CareCategoryField form={form} />
      <ValidUntilField form={form} />
      <FormButtons 
        onClose={onClose}
        isSubmitting={isSubmitting}
        editMode={editMode}
        onDelete={onDelete}
      />
    </div>
  );
};
