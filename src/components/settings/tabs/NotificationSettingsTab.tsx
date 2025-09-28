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
 * Simplified notification preferences structure - only weekly newsletter for email
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
    frequency: 'weekly';
    types: {
      weekly_summary: boolean;
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
  
  // State for notification preferences - simplified structure
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
      enabled: true,  // Keep enabled for backward compatibility
      frequency: 'weekly',
      types: {
        weekly_summary: true  // Only weekly newsletter, enabled by default
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
    // Email notifications feature is disabled - no toast needed
  };

  /**
   * Update an email preference field (disabled for now)
   */
  const updateEmailPreference = (field: keyof Omit<NotificationPreferences['email'], 'types' | 'digest_settings'>, value: boolean | string) => {
    // For now, just show coming soon message
    handleEmailComingSoon();
  };

  /**
   * Update an email type preference field (disabled for weekly_summary)
   */
  const updateEmailType = (type: keyof NotificationPreferences['email']['types'], value: boolean) => {
    // Weekly summary is always enabled - don't allow changes
    if (type === 'weekly_summary') {
      return;
    }
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
  // Simplified notification settings - only weekly newsletter for email
const allNotificationSettings = [
    {
      key: 'weekly_summary',
      title: 'Weekly Newsletter',
      description: 'Weekly digest of neighborhood activity and updates',
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
                      <Switch
                        checked={true}  // Always enabled
                        onCheckedChange={() => {}}  // Disabled - no change allowed
                        disabled={true}  // Make it visually disabled
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </div>
                </div>
              </AutoSaveField>
            ))}
          </div>

          {/* Weekly newsletter info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Your weekly newsletter is sent every Sunday at 11:00 AM with a summary of neighborhood activity and updates. The weekly newsletter is enabled for all members to keep everyone connected with the neighborhood.
            </p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};