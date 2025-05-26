
/**
 * Debug Dashboard
 * 
 * Central debug panel for development
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, Database, Bell, Users } from 'lucide-react';
import { RLSDiagnosticsPanel } from './RLSDiagnosticsPanel';
import LoggingControls from './LoggingControls';

export const DebugDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-red-500 text-white border-red-600 hover:bg-red-600"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Debug Dashboard
          </h2>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
          >
            Close
          </Button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <Tabs defaultValue="rls" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rls" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                RLS
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="logging" className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Logging
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="rls" className="mt-4">
              <RLSDiagnosticsPanel />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications Debug</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Notification debugging tools coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Users Debug</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">User debugging tools coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="logging" className="mt-4">
              <LoggingControls />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
