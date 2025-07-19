
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SafetyUpdateFormData, SAFETY_UPDATE_TYPES } from "../schema/safetyUpdateSchema";

interface SafetyTypeFieldProps {
  form: UseFormReturn<SafetyUpdateFormData>;
}

export const SafetyTypeField = ({ form }: SafetyTypeFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Type</FormLabel>
          <FormControl>
            <ToggleGroup 
              type="single" 
              value={field.value}  
              onValueChange={(value) => value && field.onChange(value)}
              className="flex flex-wrap gap-2 justify-start"
            >
              {SAFETY_UPDATE_TYPES.map((type) => {
                return (
                  <ToggleGroupItem
                    key={type.value}
                    value={type.value}
                    aria-label={type.label}
                    className="px-3 py-2 rounded-full border border-red-200 
                      bg-red-50/80 text-red-700 hover:bg-red-100/80 transition-colors text-sm
                      data-[state=on]:bg-red-500 data-[state=on]:text-white data-[state=on]:border-red-500
                      min-w-fit"
                  >
                    <span className="whitespace-nowrap">{type.label}</span>
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
