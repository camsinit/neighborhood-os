
/**
 * Description field component for skill requests
 * 
 * This component handles the user's description input for a skill session request
 */
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

/**
 * Props for the DescriptionField component
 */
interface DescriptionFieldProps {
  form: UseFormReturn<any, any, undefined>;
}

/**
 * A component for entering the description of what a user needs help with
 * 
 * @param form - The react-hook-form form object
 */
const DescriptionField: React.FC<DescriptionFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>What do you need help with?</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Describe what you'd like to learn or get help with..."
              {...field}
              aria-label="Skill session description"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DescriptionField;
