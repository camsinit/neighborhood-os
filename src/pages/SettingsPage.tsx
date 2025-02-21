
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTab } from "@/components/settings/AccountTab";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { profileFormSchema, type ProfileFormValues } from "@/components/settings/types";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  // Initialize the form with react-hook-form and zod validation
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      language: "en",
      timezone: "UTC",
      theme: "light",
      notification_preferences: {
        involved_only: false,
        page_specific: {
          events: true,
          safety: true,
          care: true,
          goods: true,
          skills: true,
          neighbors: true
        },
        all_activity: false,
        new_neighbors: true
      },
      email_visible: false,
      phone_visible: false,
      address_visible: false,
      needs_visible: false,
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    // Handle form submission
    console.log(data);
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#FDE1D3] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Page Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile">
                    <ProfileTab form={form} />
                  </TabsContent>
                  <TabsContent value="account">
                    <AccountTab form={form} />
                  </TabsContent>
                  <TabsContent value="notifications">
                    <NotificationsTab form={form} />
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
