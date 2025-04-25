
import { useState } from "react";
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
import { ImageField } from "./form/ImageField";
import { safetyUpdateSchema, SafetyUpdateFormData } from "./schema/safetyUpdateSchema";

interface SafetyUpdateFormProps {
  onClose: () => void;
  existingData?: any;
  mode?: 'create' | 'edit';
  updateId?: string;
}

export default function SafetyUpdateForm({ onClose, existingData, mode = 'create', updateId }: SafetyUpdateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SafetyUpdateFormData>({
    resolver: zodResolver(safetyUpdateSchema),
    defaultValues: {
      title: existingData?.title || "",
      description: existingData?.description || "",
      type: existingData?.type || "Emergency", // Changed from 'Alert'
      imageUrl: existingData?.imageUrl || ""
    },
  });

  const { toast } = useToast();
  const user = useUser();
  const neighborhood = useCurrentNeighborhood();
  const queryClient = useQueryClient();
  
  const { submitSafetyUpdate } = useSafetyUpdateFormSubmit(
    user,
    neighborhood,
    onClose,
    mode,
    updateId || existingData?.id
  );

  const onSubmit = async (values: SafetyUpdateFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a safety update.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitSafetyUpdate(values);
      
      queryClient.invalidateQueries({ queryKey: ["safety-updates"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      
      if (!existingData?.id) {
        form.reset({
          title: "",
          description: "",
          type: "Alert",
          imageUrl: ""
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SafetyTypeField form={form} />
        
        <SafetyTextField
          form={form}
          name="title"
          label="Title"
          placeholder="Enter a title"
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
