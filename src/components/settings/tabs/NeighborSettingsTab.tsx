
import React, { useState, useEffect } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AutoSaveField } from '../AutoSaveField';
import { UserNeighborhoods } from '../UserNeighborhoods';
import { SettingsCard } from '../SettingsCard';

/**
 * Neighbor profile settings structure (simplified - removed skills)
 */
interface NeighborSettings {
  email_visible: boolean;
  phone_visible: boolean;
  address_visible: boolean;
  needs_visible: boolean;
}

/**
 * NeighborSettingsTab Component
 * 
 * Handles neighbor profile settings with auto-saving functionality
 * using the new card-based layout design. Simplified to focus on
 * privacy settings and neighborhood membership.
 */
export const NeighborSettingsTab: React.FC = () => {
  // Get current user
  const user = useUser();
  
  // State for neighbor settings (removed skills from state)
  const [settings, setSettings] = useState<NeighborSettings>({
    email_visible: false,
    phone_visible: false,
    address_visible: false,
    needs_visible: false
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load user profile data on component mount
   */
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      try {
        // Only fetch privacy-related fields, removed skills from query
        const { data, error } = await supabase
          .from('profiles')
          .select('email_visible, phone_visible, address_visible, needs_visible')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setSettings({
            email_visible: data.email_visible || false,
            phone_visible: data.phone_visible || false,
            address_visible: data.address_visible || false,
            needs_visible: data.needs_visible || false
          });
        }
      } catch (error: any) {
        console.error('[NeighborSettingsTab] Error loading profile:', error);
        toast.error('Failed to load neighbor settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  /**
   * Update a boolean settings field
   */
  const updateBooleanField = (field: keyof NeighborSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Neighborhoods Card - Simplified */}
      <SettingsCard 
        title="Your Neighborhood" 
        description="The neighborhood you're currently part of"
      >
        <UserNeighborhoods />
      </SettingsCard>

      {/* Privacy Settings Card */}
      <SettingsCard 
        title="Directory Visibility" 
        description="Control what information is visible to other neighbors in the directory"
      >
        <div className="space-y-4">
          {/* Email visibility */}
          <AutoSaveField 
            fieldName="email_visible" 
            value={settings.email_visible}
            debounceMs={0}
          >
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Email Address</Label>
                <p className="text-sm text-gray-500">
                  Show your email in the neighbors directory
                </p>
              </div>
              <Switch
                checked={settings.email_visible}
                onCheckedChange={(value) => updateBooleanField('email_visible', value)}
              />
            </div>
          </AutoSaveField>

          {/* Phone visibility */}
          <AutoSaveField 
            fieldName="phone_visible" 
            value={settings.phone_visible}
            debounceMs={0}
          >
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Phone Number</Label>
                <p className="text-sm text-gray-500">
                  Show your phone number in the neighbors directory
                </p>
              </div>
              <Switch
                checked={settings.phone_visible}
                onCheckedChange={(value) => updateBooleanField('phone_visible', value)}
              />
            </div>
          </AutoSaveField>

          {/* Address visibility */}
          <AutoSaveField 
            fieldName="address_visible" 
            value={settings.address_visible}
            debounceMs={0}
          >
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Address</Label>
                <p className="text-sm text-gray-500">
                  Show your address in the neighbors directory
                </p>
              </div>
              <Switch
                checked={settings.address_visible}
                onCheckedChange={(value) => updateBooleanField('address_visible', value)}
              />
            </div>
          </AutoSaveField>

          {/* Access needs visibility */}
          <AutoSaveField 
            fieldName="needs_visible" 
            value={settings.needs_visible}
            debounceMs={0}
          >
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Access & Functional Needs</Label>
                <p className="text-sm text-gray-500">
                  Share any access or functional needs in the neighbors directory
                </p>
              </div>
              <Switch
                checked={settings.needs_visible}
                onCheckedChange={(value) => updateBooleanField('needs_visible', value)}
              />
            </div>
          </AutoSaveField>
        </div>
      </SettingsCard>
    </div>
  );
};
