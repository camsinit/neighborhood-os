
import { ProfileImageUpload } from "./ProfileImageUpload";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./types";

export const ProfileTab = ({ form }: { form: UseFormReturn<ProfileFormValues> }) => {
  return (
    <div className="space-y-6">
      <ProfileImageUpload />
      
      {/* Basic Info */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your display name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Write a brief bio about yourself.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contact Information */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Directory Visibility Settings</h3>
          <p className="text-sm text-gray-500">Control what information is visible to other neighbors in the directory.</p>

          {/* Email visibility notice - now shown as required */}
          <div className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gray-50">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Email Address</FormLabel>
              <FormDescription>
                Your email address is always visible to neighbors (required)
              </FormDescription>
            </div>
          </div>

          <FormField
            control={form.control}
            name="phone_visible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Phone Number</FormLabel>
                  <FormDescription>
                    Your contact phone number (optional)
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

          <FormField
            control={form.control}
            name="address_visible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Address</FormLabel>
                  <FormDescription>
                    Your neighborhood address (optional)
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

          <FormField
            control={form.control}
            name="needs_visible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Access & Functional Needs</FormLabel>
                  <FormDescription>
                    Share any access or functional needs with your neighbors (optional)
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
    </div>
  );
};
