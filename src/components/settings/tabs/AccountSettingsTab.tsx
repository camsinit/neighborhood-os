
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
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Image Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Profile Image</h3>
        <ProfileImageUpload />
      </div>

      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Basic Information</h3>
        
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
          <p className="text-sm text-gray-500">
            This is your public display name.
          </p>
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
          <p className="text-sm text-gray-500">
            Write a brief bio about yourself.
          </p>
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Preferences</h3>
        
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

      {/* Sign Out Section */}
      <div className="pt-8 border-t">
        <Button 
          variant="destructive" 
          onClick={handleSignOut}
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};
