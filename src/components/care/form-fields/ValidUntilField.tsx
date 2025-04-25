
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CareRequestFormData } from "../schemas/careRequestSchema";

/**
 * ValidUntilField component
 * 
 * This component renders a date picker for selecting when a care request expires
 */
export const ValidUntilField = ({ form }: { form: UseFormReturn<CareRequestFormData> }) => (
  <FormField
    control={form.control}
    name="validUntil"
    render={({ field }) => (
      <FormItem className="flex flex-col">
        <FormLabel>Valid Until</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant={"outline"}
                className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
              >
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={field.onChange}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )}
  />
);
