import React, { useState, useEffect } from 'react';
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { showInfoToast } from "@/utils/toast";
import { AutoSaveField } from '../AutoSaveField';
import { SettingsCard } from '../SettingsCard';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Granular notification preferences structure
 */
interface NotificationPreferences {
  email: {
    personal: {
      events: {
        event_rsvp: boolean;
        group_event_invitation: boolean;
      };
      skills: {
        skill_session_request: boolean;
        skill_session_cancelled: boolean;
      };
      groups: {
        group_member_joined: boolean;
        group_update_comment: boolean;
        group_invitation: boolean;
      };
    };
    neighborhood: {
      events: {
        event_created: boolean;
      };
      skills: {
        skill_offered: boolean;
        skill_requested: boolean;
      };
      groups: {
        group_update_posted: boolean;
        group_event_created: boolean;
      };
      neighbors: {
        neighbor_joined: boolean;
      };
    };
    weekly_summary: boolean;
  };
}

interface NotificationItemConfig {
  key: string;
  title: string;
  description: string;
  category: 'personal' | 'neighborhood' | 'weekly';
  page?: 'events' | 'skills' | 'groups' | 'neighbors';
}

/**
 * NotificationSettingsTab Component
 *
 * Displays all notification types organized by category (Personal vs Neighborhood Activity)
 * and by page, with individual email toggles and disabled text/WhatsApp/mobile toggles
 */
export const NotificationSettingsTab: React.FC = () => {
  const user = useUser();

  // Default preferences with all notifications enabled
  const defaultPreferences: NotificationPreferences = {
    email: {
      personal: {
        events: {
          event_rsvp: true,
          group_event_invitation: true,
        },
        groups: {
          group_member_joined: true,
          group_update_comment: true,
          group_invitation: true,
        },
      },
      neighborhood: {
        events: {
          event_created: true,
        },
        groups: {
          group_update_posted: true,
          group_event_created: true,
        },
        neighbors: {
          neighbor_joined: true,
        },
      },
      weekly_summary: true,
    },
  };

  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Notification configurations organized by category and page
  const personalNotifications: NotificationItemConfig[] = [
    // Events
    {
      key: 'event_rsvp',
      title: 'Event RSVPs',
      description: 'When someone RSVPs to your event',
      category: 'personal',
      page: 'events'
    },
    {
      key: 'group_event_invitation',
      title: 'Group Event Invitations',
      description: 'When you\'re invited to a group event',
      category: 'personal',
      page: 'events'
    },
    // Groups
    {
      key: 'group_member_joined',
      title: 'Group Member Joined',
      description: 'When someone joins a group you manage',
      category: 'personal',
      page: 'groups'
    },
    {
      key: 'group_update_comment',
      title: 'Group Update Comments',
      description: 'When someone comments on your group update',
      category: 'personal',
      page: 'groups'
    },
    {
      key: 'group_invitation',
      title: 'Group Invitations',
      description: 'When you\'re invited to join a group',
      category: 'personal',
      page: 'groups'
    },
  ];

  const neighborhoodNotifications: NotificationItemConfig[] = [
    // Events
    {
      key: 'event_created',
      title: 'New Events',
      description: 'When someone creates a new event',
      category: 'neighborhood',
      page: 'events'
    },
    // Groups
    {
      key: 'group_update_posted',
      title: 'Group Updates',
      description: 'When someone posts an update in a group',
      category: 'neighborhood',
      page: 'groups'
    },
    {
      key: 'group_event_created',
      title: 'Group Events',
      description: 'When someone creates a group event',
      category: 'neighborhood',
      page: 'groups'
    },
    // Neighbors
    {
      key: 'neighbor_joined',
      title: 'New Neighbors',
      description: 'When a new neighbor joins your neighborhood',
      category: 'neighborhood',
      page: 'neighbors'
    },
  ];

  /**
   * Load user notification preferences
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

        if (data?.notification_preferences) {
          setPreferences(data.notification_preferences as NotificationPreferences);
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
   * Update a notification preference
   */
  const updatePreference = (
    category: 'personal' | 'neighborhood' | 'weekly',
    page: string | undefined,
    key: string,
    value: boolean
  ) => {
    setPreferences(prev => {
      if (category === 'weekly') {
        return {
          ...prev,
          email: {
            ...prev.email,
            weekly_summary: value
          }
        };
      }

      if (!page) return prev;

      return {
        ...prev,
        email: {
          ...prev.email,
          [category]: {
            ...prev.email[category],
            [page]: {
              ...prev.email[category][page as keyof typeof prev.email[typeof category]],
              [key]: value
            }
          }
        }
      };
    });
  };

  /**
   * Get the value of a specific notification preference
   */
  const getPreferenceValue = (
    category: 'personal' | 'neighborhood' | 'weekly',
    page: string | undefined,
    key: string
  ): boolean => {
    if (category === 'weekly') {
      return preferences.email.weekly_summary;
    }

    if (!page) return false;

    const categoryPrefs = preferences.email[category];
    const pagePrefs = categoryPrefs[page as keyof typeof categoryPrefs];

    if (!pagePrefs || typeof pagePrefs !== 'object') return false;

    return (pagePrefs as Record<string, boolean>)[key] ?? false;
  };

  /**
   * Group notifications by page for display
   */
  const groupByPage = (notifications: NotificationItemConfig[]) => {
    const grouped: Record<string, NotificationItemConfig[]> = {};

    notifications.forEach(notif => {
      const page = notif.page || 'other';
      if (!grouped[page]) {
        grouped[page] = [];
      }
      grouped[page].push(notif);
    });

    return grouped;
  };

  const personalGrouped = groupByPage(personalNotifications);
  const neighborhoodGrouped = groupByPage(neighborhoodNotifications);

  const pageLabels: Record<string, string> = {
    events: 'Events',
    skills: 'Skills',
    groups: 'Groups',
    neighbors: 'Neighbors'
  };

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
      {/* Personal Notifications Section */}
      <SettingsCard
        title="Personal Notifications"
        description="Notifications about activity that directly involves you"
      >
        {/* Sticky Column Headers */}
        <div className="sticky top-0 z-10 bg-white flex justify-between items-center px-4 py-3 text-sm font-semibold text-gray-700 border-b">
          <div>Notification Type</div>
          <div className="flex gap-8">
            <div className="w-16 text-center">Email</div>
            <div className="w-16 text-center">Text</div>
            <div className="w-16 text-center">WhatsApp</div>
            <div className="w-16 text-center">Mobile</div>
          </div>
        </div>
        <div className="space-y-6">
          {Object.entries(personalGrouped).map(([page, notifications]) => (
            <div key={page} className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {pageLabels[page]}
              </h4>
              <div className="space-y-1 pl-2 border-l-2 border-gray-200">
                {notifications.map((notif) => (
                  <AutoSaveField
                    key={notif.key}
                    fieldName="notification_preferences"
                    value={preferences}
                    debounceMs={500}
                  >
                    <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{notif.title}</div>
                        <div className="text-sm text-gray-500">{notif.description}</div>
                      </div>

                      <div className="flex gap-8 items-center">
                        {/* Email Toggle */}
                        <div className="w-16 flex justify-center">
                          <Switch
                            checked={getPreferenceValue(notif.category, notif.page, notif.key)}
                            onCheckedChange={(value) =>
                              updatePreference(notif.category, notif.page, notif.key, value)
                            }
                          />
                        </div>

                        {/* Text Toggle - Disabled with tooltip */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-16 flex justify-center">
                                <Switch checked={false} disabled />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Coming Soon</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* WhatsApp Toggle - Disabled with tooltip */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-16 flex justify-center">
                                <Switch checked={false} disabled />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Coming Soon</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Mobile Toggle - Disabled with tooltip */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-16 flex justify-center">
                                <Switch checked={false} disabled />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Coming Soon</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </AutoSaveField>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Neighborhood Activity Section */}
      <SettingsCard
        title="Neighborhood Activity"
        description="General activity happening in your neighborhood"
      >
        {/* Sticky Column Headers */}
        <div className="sticky top-0 z-10 bg-white flex justify-between items-center px-4 py-3 text-sm font-semibold text-gray-700 border-b">
          <div>Notification Type</div>
          <div className="flex gap-8">
            <div className="w-16 text-center">Email</div>
            <div className="w-16 text-center">Text</div>
            <div className="w-16 text-center">WhatsApp</div>
            <div className="w-16 text-center">Mobile</div>
          </div>
        </div>
        <div className="space-y-6">
          {Object.entries(neighborhoodGrouped).map(([page, notifications]) => (
            <div key={page} className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {pageLabels[page]}
              </h4>
              <div className="space-y-1 pl-2 border-l-2 border-gray-200">
                {notifications.map((notif) => (
                  <AutoSaveField
                    key={notif.key}
                    fieldName="notification_preferences"
                    value={preferences}
                    debounceMs={500}
                  >
                    <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{notif.title}</div>
                        <div className="text-sm text-gray-500">{notif.description}</div>
                      </div>

                      <div className="flex gap-8 items-center">
                        {/* Email Toggle */}
                        <div className="w-16 flex justify-center">
                          <Switch
                            checked={getPreferenceValue(notif.category, notif.page, notif.key)}
                            onCheckedChange={(value) =>
                              updatePreference(notif.category, notif.page, notif.key, value)
                            }
                          />
                        </div>

                        {/* Text Toggle - Disabled with tooltip */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-16 flex justify-center">
                                <Switch checked={false} disabled />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Coming Soon</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* WhatsApp Toggle - Disabled with tooltip */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-16 flex justify-center">
                                <Switch checked={false} disabled />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Coming Soon</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Mobile Toggle - Disabled with tooltip */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-16 flex justify-center">
                                <Switch checked={false} disabled />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Coming Soon</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </AutoSaveField>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Weekly Summary Section */}
      <SettingsCard
        title="Weekly Summary"
        description="Weekly digest of neighborhood activity"
      >
        {/* Sticky Column Headers */}
        <div className="sticky top-0 z-10 bg-white flex justify-between items-center px-4 py-3 text-sm font-semibold text-gray-700 border-b">
          <div>Notification Type</div>
          <div className="flex gap-8">
            <div className="w-16 text-center">Email</div>
            <div className="w-16 text-center">Text</div>
            <div className="w-16 text-center">WhatsApp</div>
            <div className="w-16 text-center">Mobile</div>
          </div>
        </div>
        <AutoSaveField
          fieldName="notification_preferences"
          value={preferences}
          debounceMs={500}
        >
          <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Weekly Newsletter</div>
              <div className="text-sm text-gray-500">
                Weekly digest of neighborhood activity and updates (sent Sundays at 11:00 AM)
              </div>
            </div>

            <div className="flex gap-8 items-center">
              {/* Email Toggle */}
              <div className="w-16 flex justify-center">
                <Switch
                  checked={preferences.email.weekly_summary}
                  onCheckedChange={(value) =>
                    updatePreference('weekly', undefined, 'weekly_summary', value)
                  }
                />
              </div>

              {/* Text Toggle - Disabled */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-16 flex justify-center">
                      <Switch checked={false} disabled />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming Soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* WhatsApp Toggle - Disabled */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-16 flex justify-center">
                      <Switch checked={false} disabled />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming Soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Mobile Toggle - Disabled */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-16 flex justify-center">
                      <Switch checked={false} disabled />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming Soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </AutoSaveField>
      </SettingsCard>
    </div>
  );
};
