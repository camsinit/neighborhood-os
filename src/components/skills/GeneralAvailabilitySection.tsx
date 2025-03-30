
import React from "react";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";

/**
 * Define the form data structure for general availability
 */
interface AvailabilityFormData {
  availability: 'weekdays' | 'weekends' | 'both';
  timePreference: ('morning' | 'afternoon' | 'evening')[];
}

/**
 * Props for the GeneralAvailabilitySection component
 */
interface GeneralAvailabilitySectionProps {
  form: UseFormReturn<any, any, undefined>;
}

/**
 * A component that captures general availability preferences
 * 
 * This component allows users to specify:
 * 1. What days they are generally available (weekdays, weekends, both)
 * 2. What times of day generally work for them (morning, afternoon, evening)
 */
const GeneralAvailabilitySection: React.FC<GeneralAvailabilitySectionProps> = ({ form }) => {
  return (
    <>
      {/* Availability Field */}
      <FormField
        control={form.control}
        name="availability"
        render={({ field }) => (
          <FormItem>
            <FormLabel>When are you generally available?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekdays" id="weekdays" />
                  <label htmlFor="weekdays">Weekdays</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekends" id="weekends" />
                  <label htmlFor="weekends">Weekends</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <label htmlFor="both">Both weekdays and weekends</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Time Preference Field */}
      <FormField
        control={form.control}
        name="timePreference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What times of day generally work best for you?</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-4">
                {['morning', 'afternoon', 'evening'].map((time) => (
                  <div key={time} className="flex items-center">
                    <input
                      type="checkbox"
                      id={time}
                      checked={field.value.includes(time as any)}
                      onChange={(e) => {
                        const updatedValue = e.target.checked
                          ? [...field.value, time]
                          : field.value.filter((t: string) => t !== time);
                        field.onChange(updatedValue);
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={time} className="capitalize">
                      {time}
                    </label>
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default GeneralAvailabilitySection;
