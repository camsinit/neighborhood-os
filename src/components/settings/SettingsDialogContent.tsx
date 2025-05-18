
import { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { AccountTab } from "./AccountTab";
import { NeighborTab } from "./NeighborTab";
import { NotificationsTab } from "./NotificationsTab";
import { profileFormSchema, ProfileFormValues, NotificationPreferences } from "./types";
import { buttonVariants } from "@/components/ui/button";

/**
 * SettingsDialogContent component - The main content for settings
 * 
 * This component handles the settings form, tabs, and submission logic
 * It's been extracted from SettingsDialog for better separation of concerns
 */
const SettingsDialogContent = ({ onClose }: { onClose: () => void }) => {
  // Hooks for user data, navigation and notifications
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
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

  // Handle dialog close with unsaved changes check
  const handleDialogClose = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      // Sign out the user through Supabase
      await supabaseClient.auth.signOut();
      // Navigate to login page
      navigate("/login");
      // Show success notification
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      // Handle sign out errors
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
    }
  };

  // Save settings and close dialog
  const handleSaveAndClose = async () => {
    const success = await form.handleSubmit(async (values) => {
      await onSubmit(values);
      setShowUnsavedDialog(false);
      onClose();
    })();
  };

  // Load user profile data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      // Don't proceed if user isn't available
      if (!user) return;
      
      // Fetch user profile from database
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Handle fetch errors
      if (error) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Process and set form values if data exists
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

        // Update initial values and reset form
        setInitialValues(values);
        form.reset(values);
      }
    };

    loadProfile();
  }, [user]);

  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user || !initialValues) return;
    
    setLoading(true);
    
    try {
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
        title: "Settings saved",
      });
    } catch (error: any) {
      // Handle update errors
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main content */}
      <div className="sm:max-w-[800px] max-h-[calc(96vh)] overflow-hidden flex flex-col">
        <div className="flex flex-row items-center justify-between">
          <Button 
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={!isDirty || loading}
          >
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </div>
        <Tabs defaultValue="account" className="w-full flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="neighbor">Neighbor Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4 overflow-y-auto h-[calc(96vh-12rem)] px-1">
              <TabsContent value="account">
                <AccountTab form={form} />
              </TabsContent>
              <TabsContent value="neighbor">
                <NeighborTab form={form} />
              </TabsContent>
              <TabsContent value="notifications">
                <NotificationsTab form={form} />
              </TabsContent>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full mt-8"
              >
                Sign out
              </Button>
            </form>
          </Form>
        </Tabs>
      </div>

      {/* Unsaved changes dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowUnsavedDialog(false);
                onClose();
              }}
              className={buttonVariants({ variant: "destructive" })}
            >
              Leave without saving
            </AlertDialogAction>
            <AlertDialogAction
              onClick={handleSaveAndClose}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save and leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SettingsDialogContent;
