
/**
 * SafetyTextField component
 * 
 * This component renders the text input fields (title and description)
 * for safety update forms
 */
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { SafetyUpdateFormData } from "../schema/safetyUpdateSchema";

interface SafetyTextFieldProps {
  form: UseFormReturn<SafetyUpdateFormData>;
  name: "title" | "description";
  label: string;
  placeholder: string;
  multiline?: boolean;
}

export function SafetyTextField({ 
  form, 
  name, 
  label, 
  placeholder,
  multiline = false 
}: SafetyTextFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {multiline ? (
              <Textarea 
                placeholder={placeholder} 
                className="min-h-[120px]" 
                {...field} 
              />
            ) : (
              <Input 
                placeholder={placeholder} 
                {...field} 
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
