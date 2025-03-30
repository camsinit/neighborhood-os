
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useSafetyUpdateSubmit } from "@/hooks/safety/useSafetyUpdateSubmit";
import { useUser } from "@supabase/auth-helpers-react";
import { Shield } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define the form schema with zod validation
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  type: z.enum(["Alerts", "Maintenance", "General"], {
    required_error: "Please select a type of update.",
  }),
});

// Define the interface for form values
type FormValues = z.infer<typeof formSchema>;

interface SafetyUpdateFormNewProps {
  onSuccess?: () => void;
  existingData?: any;
}

export default function SafetyUpdateFormNew({ onSuccess, existingData }: SafetyUpdateFormNewProps) {
  // Set up form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: existingData?.title || "",
      description: existingData?.description || "",
      type: existingData?.type || "General",
    },
  });

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const toast = useToast();
  const user = useUser();
  const { submitSafetyUpdate, isLoading, error } = useSafetyUpdateSubmit();
  const queryClient = useQueryClient();

  // Function to handle the form submission
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.toast({
        title: "Error",
        description: "You must be logged in to create a safety update.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (existingData?.id) {
        // If we're editing an existing update
        result = await submitSafetyUpdate({
          id: existingData.id,
          title: values.title,
          description: values.description,
          type: values.type.toLowerCase(),
        });

        // Call the edge function to update activities
        const { error: functionError } = await supabase.functions.invoke('notify-safety-changes', {
          body: {
            safetyUpdateId: existingData.id,
            action: 'update',
            safetyUpdateTitle: values.title,
            changes: 'Safety update edited'
          }
        });

        if (functionError) {
          console.error('Error calling notify-safety-changes function:', functionError);
        }
      } else {
        // If we're creating a new update
        result = await submitSafetyUpdate({
          title: values.title,
          description: values.description,
          type: values.type.toLowerCase(),
        });
      }

      if (result) {
        // Invalidate related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["safety-updates"] });
        queryClient.invalidateQueries({ queryKey: ["activities"] });

        toast.toast({
          title: "Success!",
          description: existingData?.id
            ? "Safety update has been edited."
            : "New safety update has been created.",
        });

        // Dispatch custom event for refresh
        window.dispatchEvent(new CustomEvent('safety-update-submitted'));

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }

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
      toast.toast({
        title: "Error",
        description: "There was a problem submitting your safety update.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission error state from the hook
  if (error) {
    console.error("Safety update submit error:", error);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Type Selection (Alert, Maintenance, General) */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type of Safety Update</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select update type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Alerts">Alert</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="General">General Information</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title Input */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Textarea */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide details about the safety update" 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full bg-red-500 hover:bg-red-600 text-white"
          disabled={isSubmitting || isLoading}
        >
          <Shield className="w-4 h-4 mr-2" />
          {isSubmitting || isLoading 
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
