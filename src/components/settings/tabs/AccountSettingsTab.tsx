import React, { useState, useEffect } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AutoSaveField } from '../AutoSaveField';
import { ProfileImageUpload } from '../ProfileImageUpload';
import { SettingsCard } from '../SettingsCard';
import { FormSection } from '../FormSection';
import { DangerZone } from '../DangerZone';

/**
 * Account settings data structure
 */
interface AccountSettings {
  display_name: string;
  bio: string;
}

/**
 * AccountSettingsTab Component
 * 
 * Handles account-related settings with auto-saving functionality
 * using the new card-based layout design. Now includes a Danger Zone
 * for account deletion.
 */
export const AccountSettingsTab: React.FC = () => {
  // Get current user and navigation
  const user = useUser();
  const navigate = useNavigate();
  
  // State for account settings
  const [settings, setSettings] = useState<AccountSettings>({
    display_name: '',
    bio: ''
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
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, bio')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setSettings({
            display_name: data.display_name || '',
            bio: data.bio || ''
          });
        }
      } catch (error: any) {
        console.error('[AccountSettingsTab] Error loading profile:', error);
        toast.error('Failed to load profile settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  /**
   * Update a settings field
   */
  const updateField = (field: keyof AccountSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handle user sign out
   */
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <SettingsCard 
        title="Profile Information" 
        description="Manage your public profile and basic information"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Image Section - Left Column */}
          <div className="flex flex-col justify-start">
            <ProfileImageUpload />
          </div>

          {/* Basic Information - Right Column */}
          <div className="space-y-6">
            <FormSection title="Basic Information">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <AutoSaveField 
                  fieldName="display_name" 
                  value={settings.display_name}
                >
                  <Input
                    id="display_name"
                    placeholder="Your display name"
                    value={settings.display_name}
                    onChange={(e) => updateField('display_name', e.target.value)}
                  />
                </AutoSaveField>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <AutoSaveField 
                  fieldName="bio" 
                  value={settings.bio}
                >
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself"
                    value={settings.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </AutoSaveField>
              </div>
            </FormSection>
          </div>
        </div>
      </SettingsCard>

      {/* Account Actions Card */}
      <SettingsCard 
        title="Account Actions" 
        description="Sign out or manage your account security"
      >
        <div className="flex justify-start">
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-auto px-6"
          >
            Sign Out
          </Button>
        </div>
      </SettingsCard>

      {/* Danger Zone Card */}
      <SettingsCard 
        title="Danger Zone" 
        description="Irreversible and destructive actions"
        className="border-red-200"
      >
        <DangerZone />
      </SettingsCard>
    </div>
  );
};
