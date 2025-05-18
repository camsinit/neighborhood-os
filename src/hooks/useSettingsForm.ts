
import { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileFormSchema, ProfileFormValues, NotificationPreferences } from "@/components/settings/types";
import { fetchUserSkills } from "@/utils/notifications/skillNotifications";
import { createLogger } from "@/utils/logger";

// Create a logger for this module
const logger = createLogger('useSettingsForm');

/**
 * Custom hook to handle all settings form logic
 * 
 * This hook extracts and centralizes the form state management,
 * data loading, and submission logic from the SettingsDialogContent
 */
export const useSettingsForm = () => {
  // Hooks for user data and notifications
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const { toast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<ProfileFormValues | null>(null);

  // Set up the form with validation
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

  // Track if form has unsaved changes
  const isDirty = form.formState.isDirty;

  // Load user profile data and skills data when component mounts
  useEffect(() => {
    const loadProfileAndSkills = async () => {
      // Don't proceed if user isn't available
      if (!user) return;
      
      logger.debug("Loading profile and skills for user:", user.id);
      
      try {
        // Fetch user profile from database
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Handle fetch errors
        if (profileError) {
          logger.error("Error loading profile:", profileError);
          toast({
            title: "Error loading profile",
            description: profileError.message,
            variant: "destructive",
          });
          return;
        }

        // Fetch user's skills from skills_exchange table
        const skillCategories = await fetchUserSkills(user.id);
        logger.debug("Loaded skills from skills_exchange:", skillCategories);

        // Process and set form values if data exists
        if (profileData) {
          // Load notification preferences with defaults for missing fields
          const notificationPrefs = profileData.notification_preferences as NotificationPreferences || {
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

          // Combine profile skills with skills_exchange skills
          const profileSkills = profileData.skills || [];
          const combinedSkills = [...new Set([...profileSkills, ...skillCategories])];
          
          logger.debug("Combined skills:", combinedSkills);

          const values = {
            display_name: profileData.display_name || "",
            bio: profileData.bio || "",
            timezone: profileData.timezone || "UTC",
            language: profileData.language || "en",
            theme: profileData.theme || "light",
            skills: combinedSkills,
            notification_preferences: notificationPrefs,
            email_visible: profileData.email_visible || false,
            phone_visible: profileData.phone_visible || false,
            address_visible: profileData.address_visible || false,
            needs_visible: profileData.needs_visible || false,
          };

          // Update initial values and reset form
          setInitialValues(values);
          form.reset(values);
        }
      } catch (error) {
        logger.error("Unexpected error:", error);
        toast({
          title: "Error loading profile data",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    };

    loadProfileAndSkills();
  }, [user, form, toast]);

  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user || !initialValues) return;
    
    setLoading(true);
    
    try {
      logger.debug("Saving profile with skills:", values.skills);
      
      // Update user profile in database
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

      // Update local state
      setInitialValues(values);
      
      // Show success notification
      toast({
        title: "Settings saved successfully",
      });
      
      return true;
    } catch (error: any) {
      // Handle update errors
      logger.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Sign out the user through Supabase
      await supabaseClient.auth.signOut();
      
      // Show success notification
      toast({
        title: "Signed out successfully",
      });
      
      return true;
    } catch (error) {
      // Handle sign out errors
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    form,
    isDirty,
    loading,
    onSubmit,
    handleSignOut
  };
};
