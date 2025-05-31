
import React from "react";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";

/**
 * Define the form data structure for required availability
 */
interface RequiredAvailabilityFormData {
  availability: 'weekdays' | 'weekends' | 'both' | 'flexible';
  timePreference: ('morning' | 'afternoon' | 'evening' | 'anytime')[];
}

/**
 * Props for the RequiredAvailabilitySection component
 */
interface RequiredAvailabilitySectionProps {
  form: UseFormReturn<any, any, undefined>;
}

/**
 * A component that captures required availability preferences
 * 
 * This component requires users to specify:
 * 1. What days they are generally available (required selection)
 * 2. What times of day generally work for them (required selection)
 * 
 * Removed the general availability text field to give more space to options.
 */
const RequiredAvailabilitySection: React.FC<RequiredAvailabilitySectionProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      {/* Day Availability Field (Required) */}
      <FormField
        control={form.control}
        name="availability"
        render={({ field }) => (
          <FormItem>
            <FormLabel>When are you generally available? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="weekdays" id="weekdays" />
                  <label htmlFor="weekdays" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Weekdays only
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="weekends" id="weekends" />
                  <label htmlFor="weekends" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Weekends only
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="both" id="both" />
                  <label htmlFor="both" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Both weekdays and weekends
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="flexible" id="flexible" />
                  <label htmlFor="flexible" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Flexible schedule
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Time Preference Field (Required) */}
      <FormField
        control={form.control}
        name="timePreference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What times of day generally work best for you? (Select at least one) *</FormLabel>
            <FormControl>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
                  { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
                  { value: 'evening', label: 'Evening (5 PM - 8 PM)' },
                  { value: 'anytime', label: 'Available anytime' }
                ].map((time) => (
                  <div key={time.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={time.value}
                      checked={field.value?.includes(time.value as any) || false}
                      onCheckedChange={(checked) => {
                        const updatedValue = checked
                          ? [...(field.value || []), time.value]
                          : (field.value || []).filter((t: string) => t !== time.value);
                        field.onChange(updatedValue);
                      }}
                    />
                    <Label htmlFor={time.value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {time.label}
                    </Label>
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default RequiredAvailabilitySection;
