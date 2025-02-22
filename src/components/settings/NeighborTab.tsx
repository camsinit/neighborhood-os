
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ProfileFormValues } from "./types";
import { SkillCategory } from "../skills/types/skillTypes";
import { Button } from "@/components/ui/button";

export const NeighborTab = ({ form }: { form: UseFormReturn<ProfileFormValues> }) => {
  const skillCategories: SkillCategory[] = ['technology', 'creative', 'trade', 'education', 'wellness'];

  return (
    <div className="space-y-6">
      {/* Listed Skills Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Skills & Expertise</h3>
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Skills</FormLabel>
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    const currentSkills = field.value || [];
                    if (!currentSkills.includes(value)) {
                      field.onChange([...currentSkills, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add a skill..." />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(field.value || []).map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => {
                          const newSkills = field.value?.filter((_, i) => i !== index);
                          field.onChange(newSkills);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              <FormDescription>
                Skills you've contributed will automatically appear here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contact Information</h3>
        
        {/* Email visibility */}
        <FormField
          control={form.control}
          name="email_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Email Address</FormLabel>
                <FormDescription>
                  Show your email in the neighbors directory
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Phone visibility */}
        <FormField
          control={form.control}
          name="phone_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Phone Number</FormLabel>
                <FormDescription>
                  Show your phone number in the neighbors directory
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Address visibility */}
        <FormField
          control={form.control}
          name="address_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Address</FormLabel>
                <FormDescription>
                  Show your address in the neighbors directory
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Access needs visibility */}
        <FormField
          control={form.control}
          name="needs_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Access & Functional Needs</FormLabel>
                <FormDescription>
                  Share any access or functional needs in the neighbors directory
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
