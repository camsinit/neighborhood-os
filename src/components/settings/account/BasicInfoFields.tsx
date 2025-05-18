
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfileFormValues } from "../types";

/**
 * Basic information fields for the Account tab
 * 
 * Contains display name and bio fields
 * 
 * @param form - The form instance from react-hook-form
 */
export const BasicInfoFields = ({
  form
}: {
  form: UseFormReturn<ProfileFormValues>;
}) => {
  return (
    <div className="space-y-4">
      {/* Display Name Field */}
      <FormField 
        control={form.control} 
        name="display_name" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Display Name</FormLabel>
            <FormControl>
              <Input placeholder="Your display name" {...field} />
            </FormControl>
            <FormDescription>
              This is your public display name.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} 
      />

      {/* Bio Field */}
      <FormField 
        control={form.control} 
        name="bio" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Tell us about yourself" 
                className="resize-none" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Write a brief bio about yourself.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
  );
};
