
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CareRequestFormData } from "../schemas/careRequestSchema";

export const TitleField = ({ form }: { form: UseFormReturn<CareRequestFormData> }) => (
  <FormField
    control={form.control}
    name="title"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Title</FormLabel>
        <FormControl>
          <Input placeholder="Brief title for your care request" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
