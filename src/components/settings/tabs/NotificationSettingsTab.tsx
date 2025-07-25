import React, { useState, useEffect } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showInfoToast } from "@/utils/toast";
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
            // Ensure all in-app notifications are defaulted to true
            const basePrefs = data.notification_preferences as NotificationPreferences;
            const updatedPreferences: NotificationPreferences = {
              ...basePrefs,
              in_app: {
                ...basePrefs.in_app,
                page_specific: {
                  events: true,
                  safety: true,
                  care: true,
                  goods: true,
                  skills: true,
                  neighbors: true
                },
                new_neighbors: true
              }
            };
            setPreferences(updatedPreferences);
          } else {
            console.warn('[NotificationSettingsTab] Invalid notification preferences format, using defaults');
          }
        }
      } catch (error: any) {
        console.error('[NotificationSettingsTab] Error loading preferences:', error);
        showInfoToast('Failed to load notification settings');
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
   * Show coming soon message for email features
   */
  const handleEmailComingSoon = () => {
    showInfoToast("Email notifications aren't ready yet but are coming soon!");
  };

  /**
   * Update an email preference field (disabled for now)
   */
  const updateEmailPreference = (field: keyof Omit<NotificationPreferences['email'], 'types' | 'digest_settings'>, value: boolean | string) => {
    // For now, just show coming soon message
    handleEmailComingSoon();
  };

  /**
   * Update an email type preference field (disabled for now)
   */
  const updateEmailType = (type: keyof NotificationPreferences['email']['types'], value: boolean) => {
    // For now, just show coming soon message
    handleEmailComingSoon();
  };

  /**
   * Update digest settings (disabled for now)
   */
  const updateDigestSettings = (field: keyof NotificationPreferences['email']['digest_settings'], value: string) => {
    // For now, just show coming soon message
    handleEmailComingSoon();
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

  // Combined notification settings for unified list view
  const allNotificationSettings = [
    {
      key: 'event_rsvp',
      title: 'Event RSVPs',
      description: 'When someone RSVPs to your events',
      hasInApp: true,
      hasEmail: true,
      inAppChecked: preferences.in_app.page_specific.events,
      emailChecked: preferences.email.types.event_rsvp,
      onInAppChange: (value: boolean) => updatePageSpecific('events', value),
      onEmailChange: (value: boolean) => updateEmailType('event_rsvp', value)
    },
    {
      key: 'safety_comment',
      title: 'Safety Comments',
      description: 'When someone comments on your safety updates',
      hasInApp: true,
      hasEmail: true,
      inAppChecked: preferences.in_app.page_specific.safety,
      emailChecked: preferences.email.types.safety_comment,
      onInAppChange: (value: boolean) => updatePageSpecific('safety', value),
      onEmailChange: (value: boolean) => updateEmailType('safety_comment', value)
    },
    {
      key: 'safety_emergency',
      title: 'Emergency Alerts',
      description: 'When neighbors report emergencies in your area',
      hasInApp: true,
      hasEmail: true,
      inAppChecked: preferences.in_app.page_specific.safety,
      emailChecked: preferences.email.types.safety_emergency,
      onInAppChange: (value: boolean) => updatePageSpecific('safety', value),
      onEmailChange: (value: boolean) => updateEmailType('safety_emergency', value)
    },
    {
      key: 'goods_exchange',
      title: 'Goods Exchange',
      description: 'When someone responds to your shared items or requests',
      hasInApp: true,
      hasEmail: true,
      inAppChecked: preferences.in_app.page_specific.goods,
      emailChecked: preferences.email.types.goods_response,
      onInAppChange: (value: boolean) => updatePageSpecific('goods', value),
      onEmailChange: (value: boolean) => updateEmailType('goods_response', value)
    },
    {
      key: 'skills_sharing',
      title: 'Skills Sharing',
      description: 'When someone is interested in your skills or posts new skill requests',
      hasInApp: true,
      hasEmail: true,
      inAppChecked: preferences.in_app.page_specific.skills,
      emailChecked: preferences.email.types.goods_response, // Reuse existing email type for now
      onInAppChange: (value: boolean) => updatePageSpecific('skills', value),
      onEmailChange: (value: boolean) => updateEmailType('goods_response', value)
    },
    {
      key: 'neighbor_activity',
      title: 'Neighbor Activity',
      description: 'When neighbors interact with your posts and updates',
      hasInApp: true,
      hasEmail: false, // No email equivalent
      inAppChecked: preferences.in_app.page_specific.neighbors,
      emailChecked: false,
      onInAppChange: (value: boolean) => updatePageSpecific('neighbors', value),
      onEmailChange: () => {}
    },
    {
      key: 'new_neighbors',
      title: 'New Neighbors',
      description: 'When new neighbors join your community',
      hasInApp: true,
      hasEmail: false, // No email equivalent
      inAppChecked: preferences.in_app.new_neighbors,
      emailChecked: false,
      onInAppChange: (value: boolean) => updateInAppPreference('new_neighbors', value),
      onEmailChange: () => {}
    },
    {
      key: 'weekly_summary',
      title: 'Weekly Summary',
      description: 'Weekly digest of activity relevant to you',
      hasInApp: false, // Email only
      hasEmail: true,
      inAppChecked: false,
      emailChecked: preferences.email.types.weekly_summary,
      onInAppChange: () => {},
      onEmailChange: (value: boolean) => updateEmailType('weekly_summary', value)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <SettingsCard 
        title="Notification Settings" 
        description="Control how you receive notifications (in-app notifications enabled by default)"
      >
        <div className="space-y-4">
          {/* Notification list */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-4 py-2 text-sm font-medium text-gray-600">
              <div>Notification Type</div>
              <div>Email</div>
            </div>
            
            {allNotificationSettings.map((setting) => (
              <AutoSaveField 
                key={setting.key}
                fieldName="notification_preferences" 
                value={preferences}
                debounceMs={500}
              >
                <div className="flex justify-between items-center rounded-lg border p-4 hover:bg-gray-50">
                  {/* Title and description */}
                  <div className="flex items-center gap-4">
                    <div className="font-medium text-gray-900 w-40 flex-shrink-0">{setting.title}</div>
                    <div className="text-sm text-gray-500">{setting.description}</div>
                  </div>
                  
                  {/* Email toggle */}
                  <div className="flex justify-center">
                    {setting.hasEmail ? (
                      <div className="opacity-50">
                        <Switch
                          checked={false}
                          onCheckedChange={handleEmailComingSoon}
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </div>
                </div>
              </AutoSaveField>
            ))}
          </div>

          {/* Weekly digest settings - coming soon */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg opacity-50">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Weekly Summary Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Day of Week</Label>
                <Select disabled onValueChange={handleEmailComingSoon}>
                  <SelectTrigger>
                    <SelectValue placeholder="Coming soon" />
                  </SelectTrigger>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Time of Day</Label>
                <Select disabled onValueChange={handleEmailComingSoon}>
                  <SelectTrigger>
                    <SelectValue placeholder="Coming soon" />
                  </SelectTrigger>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};