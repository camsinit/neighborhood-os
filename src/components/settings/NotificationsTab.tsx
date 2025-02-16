
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./types";
import { Separator } from "@/components/ui/separator";

export const NotificationsTab = ({ form }: { form: UseFormReturn<ProfileFormValues> }) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="notification_preferences.involved_only"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Notifications About You</FormLabel>
              <FormDescription>
                Only receive notifications about activity that directly involves you
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

      <Separator className="my-4" />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Page-Specific Notifications</h3>
        <div className="space-y-4">
          {Object.entries({
            events: "Events",
            safety: "Safety Updates",
            care: "Care Requests",
            goods: "Goods Exchange",
            skills: "Skills Sharing",
            neighbors: "Neighbor Activity"
          }).map(([key, label]) => (
            <FormField
              key={key}
              control={form.control}
              name={`notification_preferences.page_specific.${key}`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{label}</FormLabel>
                    <FormDescription>
                      Receive notifications about new {label.toLowerCase()}
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
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      <FormField
        control={form.control}
        name="notification_preferences.all_activity"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">All Community Activity</FormLabel>
              <FormDescription>
                Receive notifications about all new activity in your community
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
        name="notification_preferences.new_neighbors"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">New Neighbor Notifications</FormLabel>
              <FormDescription>
                Get notified when new neighbors join your community
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
  );
};
