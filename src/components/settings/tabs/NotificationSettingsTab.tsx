
import React, { useState, useEffect } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AutoSaveField } from '../AutoSaveField';
import { SettingsCard } from '../SettingsCard';
import { FormSection } from '../FormSection';

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
 * Type guard to check if data is valid NotificationPreferences
 */
function isValidNotificationPreferences(data: any): data is NotificationPreferences {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.involved_only === 'boolean' &&
    data.page_specific &&
    typeof data.page_specific === 'object' &&
    typeof data.page_specific.events === 'boolean' &&
    typeof data.page_specific.safety === 'boolean' &&
    typeof data.page_specific.care === 'boolean' &&
    typeof data.page_specific.goods === 'boolean' &&
    typeof data.page_specific.skills === 'boolean' &&
    typeof data.page_specific.neighbors === 'boolean' &&
    typeof data.all_activity === 'boolean' &&
    typeof data.new_neighbors === 'boolean'
  );
}

/**
 * NotificationSettingsTab Component
 * 
 * Handles notification preferences with auto-saving functionality
 * using the new card-based layout design.
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
          // Validate and type-cast the notification preferences
          if (isValidNotificationPreferences(data.notification_preferences)) {
            setPreferences(data.notification_preferences);
          } else {
            console.warn('[NotificationSettingsTab] Invalid notification preferences format, using defaults');
          }
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
    { key: 'events' as const, label: 'Events', description: 'New events and event updates' },
    { key: 'safety' as const, label: 'Safety Updates', description: 'Safety alerts and community notices' },
    { key: 'care' as const, label: 'Care Requests', description: 'New care requests and responses' },
    { key: 'goods' as const, label: 'Goods Exchange', description: 'Available items and requests' },
    { key: 'skills' as const, label: 'Skills Sharing', description: 'Skill offers and session requests' },
    { key: 'neighbors' as const, label: 'Neighbor Activity', description: 'General neighbor interactions' }
  ];

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
      {/* General Preferences Card */}
      <SettingsCard 
        title="General Preferences" 
        description="Control your overall notification experience"
      >
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
      </SettingsCard>
      
      {/* Page-specific Notifications Card */}
      <SettingsCard 
        title="Page-Specific Notifications" 
        description="Choose which types of content you want to be notified about"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pageSpecificSettings.map(({ key, label, description }) => (
            <AutoSaveField 
              key={key}
              fieldName="notification_preferences" 
              value={preferences}
              debounceMs={0}
            >
              <div className="flex items-start justify-between rounded-lg border p-4">
                <div className="space-y-0.5 flex-1 mr-4">
                  <Label className="text-base">{label}</Label>
                  <p className="text-sm text-gray-500">
                    {description}
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
      </SettingsCard>

      {/* Community Notifications Card */}
      <SettingsCard 
        title="Community Notifications" 
        description="Stay informed about your neighborhood community"
      >
        <div className="space-y-4">
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
      </SettingsCard>
    </div>
  );
};
