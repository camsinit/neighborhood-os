
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AccountTab } from "./settings/AccountTab";
import { NeighborTab } from "./settings/NeighborTab";
import { NotificationsTab } from "./settings/NotificationsTab";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import UnsavedChangesDialog from "./settings/UnsavedChangesDialog";

/**
 * Settings Dialog Component
 * 
 * This component provides a tabbed interface for users to adjust their settings:
 * - Account settings (name, language, theme)
 * - Neighbor profile settings (bio, skills, visibility)
 * - Notification preferences
 * 
 * @param open - Whether the dialog is open
 * @param onOpenChange - Function to change open state
 */
const SettingsDialog = ({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) => {
  const supabaseClient = useSupabaseClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use our custom settings form hook
  const { 
    form, 
    isDirty, 
    loading, 
    showUnsavedDialog, 
    setShowUnsavedDialog, 
    onSubmit 
  } = useSettingsForm();

  // Handle dialog close
  const handleDialogClose = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onOpenChange(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut();
      navigate("/login");
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account"
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out",
        variant: "destructive",
      });
    }
  };

  // Handle save and close
  const handleSaveAndClose = async () => {
    const success = await form.handleSubmit(async (values) => {
      await onSubmit(values);
      setShowUnsavedDialog(false);
      onOpenChange(false);
    })();
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    onOpenChange(false);
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
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onDiscard={handleDiscardChanges}
        onSaveAndLeave={handleSaveAndClose}
      />
    </>
  );
};

export default SettingsDialog;
