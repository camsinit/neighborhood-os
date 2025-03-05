import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfileImageUpload } from "./ProfileImageUpload";
import { ProfileFormValues } from "./types";
export const AccountTab = ({
  form
}: {
  form: UseFormReturn<ProfileFormValues>;
}) => {
  return <div className="space-y-6">
      <ProfileImageUpload />
      
      {/* Basic Info */}
      <div className="space-y-4">
        <FormField control={form.control} name="display_name" render={({
        field
      }) => <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your display name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>} />

        <FormField control={form.control} name="bio" render={({
        field
      }) => <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us about yourself" className="resize-none" {...field} />
              </FormControl>
              <FormDescription>
                Write a brief bio about yourself.
              </FormDescription>
              <FormMessage />
            </FormItem>} />

        {/* Preferences */}
        <FormField control={form.control} name="language" render={({
        field
      }) => <FormItem>
              
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  
                </FormControl>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>} />

        <FormField control={form.control} name="timezone" render={({
        field
      }) => <FormItem>
              
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  
                </FormControl>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>} />

        <FormField control={form.control} name="theme" render={({
        field
      }) => <FormItem>
              
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  
                </FormControl>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>} />
      </div>
    </div>;
};