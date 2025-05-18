
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettingsForm } from "@/hooks/useSettingsForm";
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
import { AccountTab } from "./AccountTab";
import { NeighborTab } from "./NeighborTab";
import { NotificationsTab } from "./NotificationsTab";
import { buttonVariants } from "@/components/ui/button";

/**
 * SettingsDialogContent component - The main content for settings
 * 
 * This component handles the settings form, tabs, and submission logic
 * Uses the useSettingsForm hook for form state management and data operations
 */
const SettingsDialogContent = ({ onClose }: { onClose: () => void }) => {
  // Navigation hook
  const navigate = useNavigate();
  
  // Use our custom form hook
  const { form, isDirty, loading, onSubmit, handleSignOut } = useSettingsForm();
  
  // State for unsaved changes dialog
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // Handle dialog close with unsaved changes check
  const handleDialogClose = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  // Save settings and close dialog
  const handleSaveAndClose = async () => {
    const success = await form.handleSubmit(async (values) => {
      const result = await onSubmit(values);
      if (result) {
        setShowUnsavedDialog(false);
        onClose();
      }
    })();
  };

  // Handle sign out with navigation
  const performSignOut = async () => {
    const success = await handleSignOut();
    if (success) {
      // Navigate to login page
      navigate("/login");
    }
  };

  return (
    <>
      {/* Main content */}
      <div className="sm:max-w-[800px] max-h-[calc(96vh)] overflow-hidden flex flex-col">
        <div className="flex flex-row items-center justify-between mb-4">
          <Button 
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={!isDirty || loading}
            className="w-full sm:w-auto"
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
                onClick={performSignOut}
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
            <AlertDialogCancel
              onClick={() => {
                setShowUnsavedDialog(false);
                onClose();
              }}
              className={buttonVariants({ variant: "destructive" })}
            >
              Leave without saving
            </AlertDialogCancel>
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
