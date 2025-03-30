
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useForm } from 'react-hook-form';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { addDays, format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { refreshEvents } from '@/utils/refreshEvents';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

// Define form schema using zod for validation
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100),
  description: z.string().optional(),
  requestType: z.enum(['need', 'offer']),
  careCategory: z.string(),
  validUntil: z.date().min(new Date(), { message: 'Date must be in the future' }),
});

type FormData = z.infer<typeof formSchema>;

// Define care categories
const careCategories = [
  { value: 'meal_prep', label: 'Meal Prep' },
  { value: 'grocery_shopping', label: 'Grocery Shopping' },
  { value: 'childcare', label: 'Childcare' },
  { value: 'pet_care', label: 'Pet Care' },
  { value: 'house_tasks', label: 'House Tasks' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'emotional_support', label: 'Emotional Support' },
  { value: 'other', label: 'Other' },
];

interface CareRequestFormProps {
  onClose: () => void;
  initialValues?: {
    requestType?: 'need' | 'offer' | null;
    careCategory?: string;
  };
  editMode?: boolean;
  existingRequest?: any;
}

const CareRequestForm = ({
  onClose,
  initialValues = {},
  editMode = false,
  existingRequest = null
}: CareRequestFormProps) => {
  const user = useUser();
  const { neighborhood } = useCurrentNeighborhood();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup automatic refresh of activities when care requests are updated
  useAutoRefresh(
    ['activities'], 
    ['care-request-submitted']
  );

  // Set up default values for the form
  const defaultValues = {
    title: existingRequest?.title || '',
    description: existingRequest?.description || '',
    requestType: existingRequest?.request_type || initialValues.requestType || 'need',
    careCategory: existingRequest?.care_category || initialValues.careCategory || 'meal_prep',
    validUntil: existingRequest?.valid_until ? new Date(existingRequest.valid_until) : addDays(new Date(), 7),
  };

  // Initialize the form with react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!user || !neighborhood) {
      toast.error("You must be logged in and part of a neighborhood to create a care request");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        title: data.title,
        description: data.description || '',
        request_type: data.requestType,
        care_category: data.careCategory,
        valid_until: data.validUntil.toISOString(),
        user_id: user.id,
        neighborhood_id: neighborhood.id,
        support_type: 'care', // This is the "care" support type
      };

      let response;
      let action = 'create';

      // Update existing or create new based on mode
      if (editMode && existingRequest) {
        action = 'update';
        // Update existing care request
        response = await supabase
          .from('care_requests')
          .update(requestData)
          .eq('id', existingRequest.id);
      } else {
        // Create new care request
        response = await supabase
          .from('care_requests')
          .insert(requestData)
          .select();
      }

      if (response.error) {
        throw response.error;
      }

      // Call the edge function to update activities
      const newRequestId = editMode ? existingRequest.id : response.data?.[0]?.id;
      if (newRequestId) {
        // Call our edge function to handle activity feed updates
        const { error: edgeFunctionError } = await supabase.functions.invoke(
          'notify-care-changes', {
          body: {
            careRequestId: newRequestId,
            action: action,
            careRequestTitle: data.title,
            userId: user.id,
            requestType: data.requestType,
            neighborhoodId: neighborhood.id,
            changes: data.description
          }
        });

        if (edgeFunctionError) {
          console.error("Error calling edge function:", edgeFunctionError);
        }
      }

      // Show success message
      toast.success(
        editMode
          ? "Care request updated successfully"
          : "Care request created successfully"
      );

      // Trigger the refresh of activities
      refreshEvents.care();

      // Close the dialog
      onClose();
    } catch (error) {
      console.error("Error submitting care request:", error);
      toast.error("Failed to save care request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Request Type - Need or Offer */}
        <FormField
          control={form.control}
          name="requestType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Type of Request</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="need" id="need" />
                    <label htmlFor="need" className="text-sm font-medium leading-none">
                      I need help
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="offer" id="offer" />
                    <label htmlFor="offer" className="text-sm font-medium leading-none">
                      I can help
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
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
                <Input placeholder="Brief title for your request" {...field} />
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
                  placeholder="Provide details about your care request or offer"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Care Category */}
        <FormField
          control={form.control}
          name="careCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Care Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {careCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Valid Until */}
        <FormField
          control={form.control}
          name="validUntil"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Valid Until</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form action buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : editMode ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CareRequestForm;
