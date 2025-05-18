
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ProfileFormValues } from "../types";

/**
 * Component for managing contact information visibility settings
 * 
 * Controls which personal information is visible to other neighbors
 * 
 * @param form - The form instance from react-hook-form
 */
export const VisibilitySettings = ({
  form
}: {
  form: UseFormReturn<ProfileFormValues>;
}) => {
  // Array of visibility options to render
  const visibilityOptions = [
    {
      name: "email_visible",
      label: "Email Address",
      description: "Show your email in the neighbors directory"
    },
    {
      name: "phone_visible",
      label: "Phone Number",
      description: "Show your phone number in the neighbors directory"
    },
    {
      name: "address_visible",
      label: "Address",
      description: "Show your address in the neighbors directory"
    },
    {
      name: "needs_visible",
      label: "Access & Functional Needs",
      description: "Share any access or functional needs in the neighbors directory"
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Contact Information</h3>
      
      {/* Map through the visibility options to create toggle switches */}
      {visibilityOptions.map(option => (
        <FormField 
          key={option.name}
          control={form.control} 
          name={option.name as keyof ProfileFormValues} 
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{option.label}</FormLabel>
                <FormDescription>
                  {option.description}
                </FormDescription>
              </div>
              <FormControl>
                <Switch 
                  checked={field.value as boolean} 
                  onCheckedChange={field.onChange} 
                />
              </FormControl>
            </FormItem>
          )} 
        />
      ))}
    </div>
  );
};
