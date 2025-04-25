
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

export default function SafetyUpdateFormNew({ onSuccess, existingData }: SafetyUpdateFormNewProps) {
  const form = useForm<SafetyUpdateFormData>({
    resolver: zodResolver(safetyUpdateSchema),
    defaultValues: {
      title: existingData?.title || "",
      description: existingData?.description || "",
      type: existingData?.type || "Emergency", // Changed from 'Alert'
      imageUrl: existingData?.imageUrl || "",
    },
  });

  const { submitSafetyUpdate, isLoading } = useSafetyUpdateSubmit({
    onSuccess: () => {
      if (onSuccess) onSuccess();
      form.reset();
    }
  });

  const onSubmit = async (data: SafetyUpdateFormData) => {
    await submitSafetyUpdate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SafetyTypeField form={form} />
        <SafetyTextField
          form={form}
          name="title"
          label="Title"
          placeholder="Enter a title for your safety update"
        />
        <SafetyTextField
          form={form}
          name="description"
          label="Description"
          placeholder="Provide details about the safety update"
          multiline={true}
        />
        <ImageField form={form} />
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
