
import React, { useState, useEffect } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AutoSaveField } from '../AutoSaveField';
import { ProfileImageUpload } from '../ProfileImageUpload';
import { SettingsCard } from '../SettingsCard';
import { FormSection } from '../FormSection';

/**
 * Account settings data structure
 */
interface AccountSettings {
  display_name: string;
  bio: string;
  timezone: string;
  language: string;
  theme: string;
}

/**
 * AccountSettingsTab Component
 * 
 * Handles account-related settings with auto-saving functionality
 * using the new card-based layout design.
 */
export const AccountSettingsTab: React.FC = () => {
  // Get current user and navigation
  const user = useUser();
  const navigate = useNavigate();
  
  // State for account settings
  const [settings, setSettings] = useState<AccountSettings>({
    display_name: '',
    bio: '',
    timezone: 'UTC',
    language: 'en',
    theme: 'light'
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
          .select('display_name, bio, timezone, language, theme')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setSettings({
            display_name: data.display_name || '',
            bio: data.bio || '',
            timezone: data.timezone || 'UTC',
            language: data.language || 'en',
            theme: data.theme || 'light'
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
          <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
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
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <ProfileImageUpload />
            <p className="text-xs text-gray-500 text-center">
              Click to upload a new profile picture
            </p>
          </div>

          {/* Basic Information */}
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

      {/* Preferences Card */}
      <SettingsCard 
        title="Preferences" 
        description="Customize your experience with language, timezone, and theme settings"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Language */}
          <div className="space-y-2">
            <Label>Language</Label>
            <AutoSaveField 
              fieldName="language" 
              value={settings.language}
            >
              <Select 
                value={settings.language} 
                onValueChange={(value) => updateField('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </AutoSaveField>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label>Timezone</Label>
            <AutoSaveField 
              fieldName="timezone" 
              value={settings.timezone}
            >
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => updateField('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </AutoSaveField>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label>Theme</Label>
            <AutoSaveField 
              fieldName="theme" 
              value={settings.theme}
            >
              <Select 
                value={settings.theme} 
                onValueChange={(value) => updateField('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </AutoSaveField>
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
    </div>
  );
};
