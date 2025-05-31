
import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { profileFormSchema, ProfileFormValues, NotificationPreferences } from "../types";

/**
 * Hook for managing settings form state and submission
 */
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
      skills: [],
      notification_preferences: {
        involved_only: true,
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
    },
  });

  // Load profile data on mount
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
          involved_only: true,
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
        };

        const values = {
          display_name: data.display_name || "",
          bio: data.bio || "",
          timezone: data.timezone || "UTC",
          language: data.language || "en",
          theme: data.theme || "light",
          skills: data.skills || [],
          notification_preferences: notificationPrefs,
          email_visible: data.email_visible || false,
          phone_visible: data.phone_visible || false,
          address_visible: data.address_visible || false,
          needs_visible: data.needs_visible || false,
        };

        setInitialValues(values);
        form.reset(values);
      }
    };

    loadProfile();
  }, [user, form, toast]);

  // Submit form data
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user || !initialValues) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: values.display_name,
          bio: values.bio,
          timezone: values.timezone,
          language: values.language,
          theme: values.theme,
          skills: values.skills,
          notification_preferences: values.notification_preferences,
          email_visible: values.email_visible,
          phone_visible: values.phone_visible,
          address_visible: values.address_visible,
          needs_visible: values.needs_visible,
        })
        .eq("id", user.id);

      if (error) throw error;

      setInitialValues(values);
      toast({
        title: "Settings saved",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    initialValues,
    onSubmit,
    isDirty: form.formState.isDirty,
  };
};
