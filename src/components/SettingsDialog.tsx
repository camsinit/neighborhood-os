
import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
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
import { useSettingsForm } from "./settings/hooks/useSettingsForm";
import { SettingsHeader } from "./settings/components/SettingsHeader";
import { UnsavedChangesDialog } from "./settings/components/UnsavedChangesDialog";

/**
 * SettingsDialog component
 * 
 * REFACTORED: Simplified by extracting form logic and UI components
 */
const SettingsDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const supabaseClient = useSupabaseClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // Use the custom hook for form management
  const { form, loading, onSubmit, isDirty } = useSettingsForm();

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

  const handleSaveAndClose = async () => {
    const success = await form.handleSubmit(async (values) => {
      await onSubmit(values);
      setShowUnsavedDialog(false);
      onOpenChange(false);
    })();
  };

  const handleLeaveWithoutSaving = () => {
    setShowUnsavedDialog(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[calc(96vh)] overflow-hidden flex flex-col">
          <SettingsHeader 
            onSave={form.handleSubmit(onSubmit)}
            isDirty={isDirty}
            loading={loading}
          />
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
        onLeaveWithoutSaving={handleLeaveWithoutSaving}
        onSaveAndLeave={handleSaveAndClose}
      />
    </>
  );
};

export default SettingsDialog;
