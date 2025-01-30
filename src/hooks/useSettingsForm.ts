import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { profileFormSchema, ProfileFormValues, NotificationPreferences } from "@/components/settings/types";

export const useSettingsForm = () => {
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
    loadProfile();
  }, [user]);

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

  return {
    form,
    loading,
    onSubmit,
  };
};