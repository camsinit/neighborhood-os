/**
 * Group View Tabs Component
 * 
 * Provides tabbed navigation for different views of group content:
 * - Timeline: Mixed chronological feed of events and updates
 * - Updates: Only group updates/posts
 * - Events: Only group events
 * 
 * Always defaults to Timeline view as requested
 */

import React from 'react';
import { ThemedTabs, ThemedTabsList, ThemedTabsTrigger, ThemedTabsContent } from '@/components/ui/themed-tabs';

export type GroupViewType = 'timeline' | 'updates' | 'events';

interface GroupViewTabsProps {
  activeView: GroupViewType;
  onViewChange: (view: GroupViewType) => void;
  children: React.ReactNode;
}

export const GroupViewTabs: React.FC<GroupViewTabsProps> = ({
  activeView,
  onViewChange,
  children
}) => {
  return (
    <ThemedTabs 
      value={activeView} 
      onValueChange={(value) => onViewChange(value as GroupViewType)}
      className="w-full"
    >
      {/* Tab Navigation */}
      <ThemedTabsList className="grid w-full grid-cols-3 mb-4" themeColor="neighbors">
        <ThemedTabsTrigger 
          value="timeline" 
          className="text-sm font-medium"
          themeColor="neighbors"
        >
          Timeline
        </ThemedTabsTrigger>
        <ThemedTabsTrigger 
          value="updates" 
          className="text-sm font-medium"
          themeColor="neighbors"
        >
          Updates
        </ThemedTabsTrigger>
        <ThemedTabsTrigger 
          value="events" 
          className="text-sm font-medium"
          themeColor="neighbors"
        >
          Events
        </ThemedTabsTrigger>
      </ThemedTabsList>

      {/* Tab Content */}
      <ThemedTabsContent value={activeView} className="mt-0">
        {children}
      </ThemedTabsContent>
    </ThemedTabs>
  );
};