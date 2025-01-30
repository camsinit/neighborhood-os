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
import { ProfileTab } from "./settings/ProfileTab";
import { AccountTab } from "./settings/AccountTab";
import { NotificationsTab } from "./settings/NotificationsTab";
import { useSettingsForm } from "@/hooks/useSettingsForm";

const SettingsDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { form, loading, onSubmit } = useSettingsForm();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[750px] h-[650px] bg-background">
        <div className="flex flex-col h-full p-[50px]">
          <DialogHeader className="mb-4">
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="profile" className="flex flex-col flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 mt-4">
                <div className="flex-1 overflow-y-auto pr-6">
                  <TabsContent value="profile" className="mt-0">
                    <ProfileTab form={form} />
                  </TabsContent>
                  <TabsContent value="account" className="mt-0">
                    <AccountTab form={form} />
                  </TabsContent>
                  <TabsContent value="notifications" className="mt-0">
                    <NotificationsTab form={form} />
                  </TabsContent>
                </div>
                <div className="flex justify-end pt-4 mt-4 border-t">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;