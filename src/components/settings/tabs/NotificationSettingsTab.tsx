
import React, { useState, useEffect } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AutoSaveField } from '../AutoSaveField';

/**
 * Notification preferences structure
 */
interface NotificationPreferences {
  involved_only: boolean;
  page_specific: {
    events: boolean;
    safety: boolean;
    care: boolean;
    goods: boolean;
    skills: boolean;
    neighbors: boolean;
  };
  all_activity: boolean;
  new_neighbors: boolean;
}

/**
 * NotificationSettingsTab Component
 * 
 * Handles notification preferences with auto-saving functionality
 */
export const NotificationSettingsTab: React.FC = () => {
  // Get current user
  const user = useUser();
  
  // State for notification preferences
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    involved_only: true,
    page_specific: {
      events: true,
      safety: true,
      care: true,
      goods: true,
      skills: true,
      neighbors: true
    },
    all_activity: false,
    new_neighbors: true
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load user notification preferences on component mount
   */
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_preferences')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data && data.notification_preferences) {
          setPreferences(data.notification_preferences as NotificationPreferences);
        }
      } catch (error: any) {
        console.error('[NotificationSettingsTab] Error loading preferences:', error);
        toast.error('Failed to load notification settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

  /**
   * Update a top-level preference field
   */
  const updatePreference = (field: keyof Omit<NotificationPreferences, 'page_specific'>, value: boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Update a page-specific preference field
   */
  const updatePageSpecific = (page: keyof NotificationPreferences['page_specific'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      page_specific: {
        ...prev.page_specific,
        [page]: value
      }
    }));
  };

  // Page-specific notification settings configuration
  const pageSpecificSettings = [
    { key: 'events' as const, label: 'Events' },
    { key: 'safety' as const, label: 'Safety Updates' },
    { key: 'care' as const, label: 'Care Requests' },
    { key: 'goods' as const, label: 'Goods Exchange' },
    { key: 'skills' as const, label: 'Skills Sharing' },
    { key: 'neighbors' as const, label: 'Neighbor Activity' }
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* General notification preferences */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">General Preferences</h3>
        
        {/* Involved only notifications */}
        <AutoSaveField 
          fieldName="notification_preferences" 
          value={preferences}
          debounceMs={0}
        >
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Notifications About You</Label>
              <p className="text-sm text-gray-500">
                Only receive notifications about activity that directly involves you
              </p>
            </div>
            <Switch
              checked={preferences.involved_only}
              onCheckedChange={(value) => updatePreference('involved_only', value)}
            />
          </div>
        </AutoSaveField>
      </div>

      <Separator />
      
      {/* Page-specific notifications */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Page-Specific Notifications</h3>
        
        <div className="space-y-4">
          {pageSpecificSettings.map(({ key, label }) => (
            <AutoSaveField 
              key={key}
              fieldName="notification_preferences" 
              value={preferences}
              debounceMs={0}
            >
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">{label}</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications about new {label.toLowerCase()}
                  </p>
                </div>
                <Switch
                  checked={preferences.page_specific[key]}
                  onCheckedChange={(value) => updatePageSpecific(key, value)}
                />
              </div>
            </AutoSaveField>
          ))}
        </div>
      </div>

      <Separator />

      {/* Community-wide notifications */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Community Notifications</h3>
        
        {/* All activity notifications */}
        <AutoSaveField 
          fieldName="notification_preferences" 
          value={preferences}
          debounceMs={0}
        >
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">All Community Activity</Label>
              <p className="text-sm text-gray-500">
                Receive notifications about all new activity in your community
              </p>
            </div>
            <Switch
              checked={preferences.all_activity}
              onCheckedChange={(value) => updatePreference('all_activity', value)}
            />
          </div>
        </AutoSaveField>

        {/* New neighbor notifications */}
        <AutoSaveField 
          fieldName="notification_preferences" 
          value={preferences}
          debounceMs={0}
        >
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">New Neighbor Notifications</Label>
              <p className="text-sm text-gray-500">
                Get notified when new neighbors join your community
              </p>
            </div>
            <Switch
              checked={preferences.new_neighbors}
              onCheckedChange={(value) => updatePreference('new_neighbors', value)}
            />
          </div>
        </AutoSaveField>
      </div>
    </div>
  );
};
