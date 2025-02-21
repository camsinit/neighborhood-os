
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountTab from "@/components/settings/AccountTab";
import ProfileTab from "@/components/settings/ProfileTab";
import NotificationsTab from "@/components/settings/NotificationsTab";

const SettingsPage = () => {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#FDE1D3] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Page Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>
              <TabsContent value="account">
                <AccountTab />
              </TabsContent>
              <TabsContent value="notifications">
                <NotificationsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
