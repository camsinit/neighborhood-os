
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
import ModuleTag from "@/components/ui/module-tag";

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
                    className="p-0 border-0 bg-transparent hover:bg-transparent"
                    asChild
                  >
                    <ModuleTag
                      moduleTheme="safety"
                      variant="pastel"
                      selected={field.value === type.value}
                      className="cursor-pointer"
                    >
                      <span className="whitespace-nowrap">{type.label}</span>
                    </ModuleTag>
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
