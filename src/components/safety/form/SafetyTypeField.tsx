
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
import { AlertTriangle, Clock, Cloud, Wrench, Shield } from "lucide-react";

// Map safety types to their respective icons
const safetyTypeIcons = {
  "Emergency": AlertTriangle,
  "Suspicious Activity": AlertTriangle,
  "Infrastructure": Wrench,
  "Weather Alert": Cloud,
  "General Safety": Shield
};

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
                const IconComponent = safetyTypeIcons[type.value as keyof typeof safetyTypeIcons] || Clock;
                return (
                  <ToggleGroupItem
                    key={type.value}
                    value={type.value}
                    aria-label={type.label}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 
                      bg-gray-50/80 text-gray-700 hover:bg-gray-100/80 transition-colors text-sm
                      data-[state=on]:bg-amber-500 data-[state=on]:text-white data-[state=on]:border-amber-500
                      min-w-fit"
                  >
                    <IconComponent className="h-3.5 w-3.5" />
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
