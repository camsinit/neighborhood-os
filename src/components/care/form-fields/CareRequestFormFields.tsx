
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { careCategories } from "../schemas/careRequestSchema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { CareRequestFormData } from "../schemas/careRequestSchema";

/**
 * RequestTypeField component
 * 
 * Renders the radio buttons for selecting request type (need or offer)
 */
export const RequestTypeField = ({ form }: { form: UseFormReturn<CareRequestFormData> }) => (
  <FormField
    control={form.control}
    name="requestType"
    render={({ field }) => (
      <FormItem className="space-y-3">
        <FormLabel>Type of Request</FormLabel>
        <FormControl>
          <RadioGroup
            onValueChange={field.onChange}
            defaultValue={field.value}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="need" id="need" />
              <label htmlFor="need" className="text-sm font-medium leading-none">
                I need help
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="offer" id="offer" />
              <label htmlFor="offer" className="text-sm font-medium leading-none">
                I can help
              </label>
            </div>
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * TitleField component
 * 
 * Renders the title input field
 */
export const TitleField = ({ form }: { form: UseFormReturn<CareRequestFormData> }) => (
  <FormField
    control={form.control}
    name="title"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Title</FormLabel>
        <FormControl>
          <Input placeholder="Brief title for your request" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * DescriptionField component
 * 
 * Renders the description textarea field
 */
export const DescriptionField = ({ form }: { form: UseFormReturn<CareRequestFormData> }) => (
  <FormField
    control={form.control}
    name="description"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea
            placeholder="Provide details about your care request or offer"
            className="min-h-[100px]"
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * CareCategoryField component
 * 
 * Renders the category select dropdown
 */
export const CareCategoryField = ({ form }: { form: UseFormReturn<CareRequestFormData> }) => (
  <FormField
    control={form.control}
    name="careCategory"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Care Category</FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {careCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * ValidUntilField component
 * 
 * Renders the date picker for setting the valid until date
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
                className={cn(
                  "pl-3 text-left font-normal",
                  !field.value && "text-muted-foreground"
                )}
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

/**
 * FormButtons component
 * 
 * Renders the form action buttons (cancel and submit)
 */
export const FormButtons = ({ 
  onClose, 
  isSubmitting, 
  editMode 
}: { 
  onClose: () => void;
  isSubmitting: boolean;
  editMode: boolean;
}) => (
  <div className="flex justify-end gap-4 pt-4">
    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
      Cancel
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Saving..." : editMode ? "Update" : "Create"}
    </Button>
  </div>
);
