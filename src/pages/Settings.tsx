import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { AccountTab } from "@/components/settings/AccountTab";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { profileFormSchema, ProfileFormValues, NotificationPreferences } from "@/components/settings/types";

const Settings = () => {
  const navigate = useNavigate();
  const user = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<ProfileFormValues | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: "",
      bio: "",
      timezone: "UTC",
      language: "en",
      theme: "light",
      first_name: "",
      last_name: "",
      email: "",
      notification_preferences: {
        email: true,
        push: true,
      },
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const notificationPrefs = data.notification_preferences as NotificationPreferences || {
          email: true,
          push: true,
        };

        const values = {
          display_name: data.display_name || "",
          bio: data.bio || "",
          timezone: data.timezone || "UTC",
          language: data.language || "en",
          theme: data.theme || "light",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          notification_preferences: notificationPrefs,
        };

        setInitialValues(values);
        form.reset(values);
      }
    };

    loadProfile();
  }, [user]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user || !initialValues) return;
    
    const hasChanges = Object.keys(values).some(key => {
      if (key === 'notification_preferences') {
        return JSON.stringify(values[key]) !== JSON.stringify(initialValues[key]);
      }
      return values[key] !== initialValues[key];
    });

    if (!hasChanges) {
      toast({
        title: "No changes detected",
        description: "No changes were made to your profile settings.",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: values.display_name,
        bio: values.bio,
        timezone: values.timezone,
        language: values.language,
        theme: values.theme,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        notification_preferences: values.notification_preferences,
      })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setInitialValues(values);
    toast({
      title: "Settings updated",
      description: "Your profile settings have been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Sonner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h1 className="text-2xl font-semibold mb-6">Settings</h1>
            
            <Tabs defaultValue="profile" className="flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="profile" className="focus:ring-0 focus-visible:ring-0 focus-visible:outline-none">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="account" className="focus:ring-0 focus-visible:ring-0 focus-visible:outline-none">
                  Account
                </TabsTrigger>
                <TabsTrigger value="notifications" className="focus:ring-0 focus-visible:ring-0 focus-visible:outline-none">
                  Notifications
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
                    <ProfileTab form={form} />
                  </TabsContent>
                  <TabsContent value="account" className="mt-0 focus-visible:outline-none">
                    <AccountTab form={form} />
                  </TabsContent>
                  <TabsContent value="notifications" className="mt-0 focus-visible:outline-none">
                    <NotificationsTab form={form} />
                  </TabsContent>

                  <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;