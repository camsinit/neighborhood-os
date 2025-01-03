import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ProfileTab } from "./settings/ProfileTab";
import { AccountTab } from "./settings/AccountTab";
import { NotificationsTab } from "./settings/NotificationsTab";
import { profileFormSchema, ProfileFormValues, NotificationPreferences } from "./settings/types";

const SettingsDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
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
    
    // Check if any values have actually changed
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
              <TabsContent value="profile">
                <ProfileTab form={form} />
              </TabsContent>
              <TabsContent value="account">
                <AccountTab form={form} />
              </TabsContent>
              <TabsContent value="notifications">
                <NotificationsTab form={form} />
              </TabsContent>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;