
import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import { ProfileTab } from "./settings/ProfileTab";
import { AccountTab } from "./settings/AccountTab";
import { NotificationsTab } from "./settings/NotificationsTab";
import { profileFormSchema, ProfileFormValues, NotificationPreferences } from "./settings/types";

const SettingsDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
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
    },
  });

  const isDirty = form.formState.isDirty;

  const handleDialogClose = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut();
      navigate("/login");
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
    }
  };

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
          notification_preferences: values.notification_preferences,
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[calc(96vh)] overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <Button 
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={!isDirty || loading}
            >
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogHeader>
          <Tabs defaultValue="profile" className="w-full flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4 overflow-y-auto h-[calc(96vh-12rem)] px-1">
                <TabsContent value="profile">
                  <ProfileTab form={form} />
                </TabsContent>
                <TabsContent value="account">
                  <AccountTab form={form} />
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
        </DialogContent>
      </Dialog>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUnsavedDialog(false);
                onOpenChange(false);
              }}
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SettingsDialog;
