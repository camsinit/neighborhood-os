
import React from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettingsTab } from '@/components/settings/tabs/AccountSettingsTab';
import { NeighborSettingsTab } from '@/components/settings/tabs/NeighborSettingsTab';
import { NotificationSettingsTab } from '@/components/settings/tabs/NotificationSettingsTab';

/**
 * SettingsPage Component
 * 
 * Main settings page that displays user settings in a standard page layout
 * instead of a dialog. Uses auto-saving for all fields to improve UX.
 */
function SettingsPage() {
  return (
    <ModuleContainer themeColor="neighbors">
      {/* Standard page header */}
      <ModuleHeader 
        title="Account Settings" 
        themeColor="neighbors"
      />
      
      {/* Description section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-6 sm:px-[25px]">
        <div className="module-description bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm mx-0 px-[16px]">
          <p className="text-gray-700 text-sm">Manage your account settings and preferences</p>
        </div>
      </div>
      
      <ModuleContent>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          {/* Settings tabs */}
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="neighbor">Neighbor Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            {/* Account settings tab */}
            <TabsContent value="account" className="space-y-6">
              <AccountSettingsTab />
            </TabsContent>
            
            {/* Neighbor profile tab */}
            <TabsContent value="neighbor" className="space-y-6">
              <NeighborSettingsTab />
            </TabsContent>
            
            {/* Notifications tab */}
            <TabsContent value="notifications" className="space-y-6">
              <NotificationSettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </ModuleContent>
    </ModuleContainer>
  );
}

export default SettingsPage;
