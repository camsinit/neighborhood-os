import React, { useState, useEffect } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AutoSaveField } from '../AutoSaveField';
import { SettingsCard } from '../SettingsCard';

/**
 * Complete notification preferences structure including email settings
 */
interface NotificationPreferences {
  in_app: {
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
  };
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'off';
    types: {
      event_rsvp: boolean;
      safety_comment: boolean;
      safety_emergency: boolean;
      goods_response: boolean;
      skill_session_request: boolean;
      weekly_summary: boolean;
    };
    digest_settings: {
      day_of_week: string;
      time_of_day: string;
    };
  };
}

/**
 * Type guard to check if data is valid NotificationPreferences
 */
function isValidNotificationPreferences(data: any): data is NotificationPreferences {
  return (
    data &&
    typeof data === 'object' &&
    data.in_app &&
    typeof data.in_app === 'object' &&
    typeof data.in_app.involved_only === 'boolean' &&
    data.in_app.page_specific &&
    typeof data.in_app.page_specific === 'object' &&
    data.email &&
    typeof data.email === 'object' &&
    typeof data.email.enabled === 'boolean'
  );
}

/**
 * NotificationSettingsTab Component
 * 
 * Handles notification preferences for both in-app and email notifications
 * with auto-saving functionality using the card-based layout design.
 */
export const NotificationSettingsTab: React.FC = () => {
  // Get current user
  const user = useUser();
  
  // State for notification preferences - use the complete structure
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    in_app: {
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
    },
    email: {
      enabled: false,
      frequency: 'weekly',
      types: {
        event_rsvp: false,
        safety_comment: false,
        safety_emergency: true,
        goods_response: false,
        skill_session_request: false,
        weekly_summary: true
      },
      digest_settings: {
        day_of_week: 'Sunday',
        time_of_day: '09:00'
      }
    }
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
   * Update an in-app preference field
   */
  const updateInAppPreference = (field: keyof Omit<NotificationPreferences['in_app'], 'page_specific'>, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      in_app: {
        ...prev.in_app,
        [field]: value
      }
    }));
  };

  /**
   * Update a page-specific in-app preference field
   */
  const updatePageSpecific = (page: keyof NotificationPreferences['in_app']['page_specific'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      in_app: {
        ...prev.in_app,
        page_specific: {
          ...prev.in_app.page_specific,
          [page]: value
        }
      }
    }));
  };

  /**
   * Update an email preference field
   */
  const updateEmailPreference = (field: keyof Omit<NotificationPreferences['email'], 'types' | 'digest_settings'>, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [field]: value
      }
    }));
  };

  /**
   * Update an email type preference field
   */
  const updateEmailType = (type: keyof NotificationPreferences['email']['types'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      email: {
        ...prev.email,
        types: {
          ...prev.email.types,
          [type]: value
        }
      }
    }));
  };

  /**
   * Update digest settings
   */
  const updateDigestSettings = (field: keyof NotificationPreferences['email']['digest_settings'], value: string) => {
    setPreferences(prev => ({
      ...prev,
      email: {
        ...prev.email,
        digest_settings: {
          ...prev.email.digest_settings,
          [field]: value
        }
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

  // Email notification types configuration
  const emailTypes = [
    { key: 'event_rsvp' as const, label: 'Event RSVPs', description: 'When someone RSVPs to your events' },
    { key: 'safety_comment' as const, label: 'Safety Comments', description: 'Comments on your safety updates' },
    { key: 'safety_emergency' as const, label: 'Emergency Alerts', description: 'Critical safety notifications' },
    { key: 'goods_response' as const, label: 'Goods Responses', description: 'Responses to your goods posts' },
    { key: 'weekly_summary' as const, label: 'Weekly Summary', description: 'Summary of neighborhood activity' }
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
      {/* In-App Notifications Section */}
      <SettingsCard 
        title="In-App Notifications" 
        description="Control notifications you see within the app (all enabled by default)"
      >
        <div className="space-y-6">
          {/* General in-app preferences */}
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
                checked={preferences.in_app.involved_only}
                onCheckedChange={(value) => updateInAppPreference('involved_only', value)}
              />
            </div>
          </AutoSaveField>

          {/* Page-specific notifications */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Content Types</h4>
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
                      checked={preferences.in_app.page_specific[key]}
                      onCheckedChange={(value) => updatePageSpecific(key, value)}
                    />
                  </div>
                </AutoSaveField>
              ))}
            </div>
          </div>

          {/* Community notifications */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Community Activity</h4>
            <div className="space-y-4">
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
                    checked={preferences.in_app.all_activity}
                    onCheckedChange={(value) => updateInAppPreference('all_activity', value)}
                  />
                </div>
              </AutoSaveField>

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
                    checked={preferences.in_app.new_neighbors}
                    onCheckedChange={(value) => updateInAppPreference('new_neighbors', value)}
                  />
                </div>
              </AutoSaveField>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Email Notifications Section */}
      <SettingsCard 
        title="Email Notifications" 
        description="Choose when and how you receive email notifications (weekly summary enabled by default)"
      >
        <div className="space-y-6">
          {/* Master email toggle */}
          <AutoSaveField 
            fieldName="notification_preferences" 
            value={preferences}
            debounceMs={0}
          >
            <div className="flex items-center justify-between rounded-lg border p-4 bg-blue-50">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Enable Email Notifications</Label>
                <p className="text-sm text-gray-600">
                  Master control for all email notifications
                </p>
              </div>
              <Switch
                checked={preferences.email.enabled}
                onCheckedChange={(value) => updateEmailPreference('enabled', value)}
              />
            </div>
          </AutoSaveField>

          {/* Email frequency - only show if emails are enabled */}
          {preferences.email.enabled && (
            <AutoSaveField 
              fieldName="notification_preferences" 
              value={preferences}
              debounceMs={0}
            >
              <div className="rounded-lg border p-4">
                <div className="space-y-3">
                  <Label className="text-base">Email Frequency</Label>
                  <Select
                    value={preferences.email.frequency}
                    onValueChange={(value: any) => updateEmailPreference('frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                      <SelectItem value="off">Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AutoSaveField>
          )}

          {/* Email types - only show if emails are enabled */}
          {preferences.email.enabled && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Email Types</h4>
              <div className="space-y-4">
                {emailTypes.map(({ key, label, description }) => (
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
                        checked={preferences.email.types[key]}
                        onCheckedChange={(value) => updateEmailType(key, value)}
                      />
                    </div>
                  </AutoSaveField>
                ))}
              </div>
            </div>
          )}

          {/* Weekly digest settings - only show if weekly summary is enabled */}
          {preferences.email.enabled && preferences.email.types.weekly_summary && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Weekly Summary Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AutoSaveField 
                  fieldName="notification_preferences" 
                  value={preferences}
                  debounceMs={0}
                >
                  <div className="rounded-lg border p-4">
                    <div className="space-y-3">
                      <Label className="text-sm">Day of Week</Label>
                      <Select
                        value={preferences.email.digest_settings.day_of_week}
                        onValueChange={(value) => updateDigestSettings('day_of_week', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sunday">Sunday</SelectItem>
                          <SelectItem value="Monday">Monday</SelectItem>
                          <SelectItem value="Tuesday">Tuesday</SelectItem>
                          <SelectItem value="Wednesday">Wednesday</SelectItem>
                          <SelectItem value="Thursday">Thursday</SelectItem>
                          <SelectItem value="Friday">Friday</SelectItem>
                          <SelectItem value="Saturday">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AutoSaveField>

                <AutoSaveField 
                  fieldName="notification_preferences" 
                  value={preferences}
                  debounceMs={0}
                >
                  <div className="rounded-lg border p-4">
                    <div className="space-y-3">
                      <Label className="text-sm">Time of Day</Label>
                      <Select
                        value={preferences.email.digest_settings.time_of_day}
                        onValueChange={(value) => updateDigestSettings('time_of_day', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="06:00">6:00 AM</SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="15:00">3:00 PM</SelectItem>
                          <SelectItem value="18:00">6:00 PM</SelectItem>
                          <SelectItem value="21:00">9:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AutoSaveField>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  );
};