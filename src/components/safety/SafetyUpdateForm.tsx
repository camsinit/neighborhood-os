
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useUser } from "@supabase/auth-helpers-react";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { 
  safetyUpdateSchema,
  SafetyUpdateFormData, 
  SafetyUpdateFormProps 
} from "./schema/safetyUpdateSchema";
import { useSafetyUpdateFormSubmit } from "./hooks/useSafetyUpdateFormSubmit";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

/**
 * SafetyUpdateForm component
 * 
 * This refactored component uses the same pattern as the care request form,
 * with a form hook and validation for better maintainability
 */
const SafetyUpdateForm = ({ 
  onClose, 
  initialValues, 
  mode = 'create', 
  updateId 
}: SafetyUpdateFormProps) => {
  // Get the current user and neighborhood
  const user = useUser();
  const neighborhoodData = useCurrentNeighborhood();
  
  // Setup the form submission hook
  const { isSubmitting, submitSafetyUpdate } = useSafetyUpdateFormSubmit(
    user,
    neighborhoodData,
    onClose,
    mode,
    updateId
  );

  // Set up default values for the form
  const defaultValues = {
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    type: initialValues?.type || '',
  };

  // Initialize the form with react-hook-form
  const form = useForm<SafetyUpdateFormData>({
    resolver: zodResolver(safetyUpdateSchema),
    defaultValues,
  });

  // Handle form submission
  const onSubmit = (data: SafetyUpdateFormData) => {
    submitSafetyUpdate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Update Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Update Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="alerts">Alerts</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="updates">Updates</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Title of your safety update" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Provide details about the safety update"
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form action buttons */}
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-[#ea384c] hover:bg-[#ea384c]/90"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? "Saving..." 
              : mode === 'edit' 
                ? "Update" 
                : "Share Update"
            }
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default SafetyUpdateForm;
