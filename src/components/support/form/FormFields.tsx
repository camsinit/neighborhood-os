
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { SupportRequestFormData } from "../types/formTypes";

/**
 * FormFields component
 * 
 * This component handles all the input fields for the support request form
 * in a reusable way similar to the CareRequestFormFields component
 */
interface FormFieldsProps {
  form: UseFormReturn<SupportRequestFormData>;
}

const FormFields = ({ form }: FormFieldsProps) => {
  // Watch form values to conditionally render fields
  const category = form.watch('category');
  const requestType = form.watch('requestType');
  
  // Determine whether to show category field
  const showCategoryField = requestType !== 'offer' || category !== 'skills';
  const isCareCategory = category === 'care';

  return (
    <>
      {/* Request Type Field */}
      <FormField
        control={form.control}
        name="requestType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Request Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="need">I need help</SelectItem>
                <SelectItem value="offer">I can help</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category Field */}
      {showCategoryField && (
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="goods">Goods</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="skills">Skills</SelectItem>
                  <SelectItem value="care">Care</SelectItem>
                  <SelectItem value="resources">Resources</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Care Category Field (only shown when category is 'care') */}
      {isCareCategory && (
        <FormField
          control={form.control}
          name="care_category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Care Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select care type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="household">Household Tasks</SelectItem>
                  <SelectItem value="medical">Medical Assistance</SelectItem>
                  <SelectItem value="childcare">Childcare</SelectItem>
                  <SelectItem value="eldercare">Elder Care</SelectItem>
                  <SelectItem value="petcare">Pet Care</SelectItem>
                  <SelectItem value="mealprep">Meal Preparation</SelectItem>
                  <SelectItem value="general">General Assistance</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Support Type Field */}
      <FormField
        control={form.control}
        name="supportType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Support Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select support type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Title Field */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter a title for your request" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description Field */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Describe your request in detail"
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Valid Until Field */}
      <FormField
        control={form.control}
        name="validUntil"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valid Until</FormLabel>
            <FormControl>
              <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default FormFields;
