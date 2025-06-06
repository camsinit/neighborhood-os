
/**
 * Debug Page - Consolidated debugging tools for Super Admins only
 * 
 * This page combines the functionality from DebugDashboard and RLSDiagnosticsPanel
 * into a single comprehensive debugging interface accessible only to Super Admins.
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, Database, Bell, Users, Activity } from 'lucide-react';
import { RLSDiagnosticsPanel } from '@/components/debug/RLSDiagnosticsPanel';
import { ActivityDebugPanel } from '@/components/debug/ActivityDebugPanel';
import LoggingControls from '@/components/debug/LoggingControls';
import MainLayout from '@/components/layout/MainLayout';

/**
 * DebugPage component
 * 
 * Provides comprehensive debugging tools including:
 * - Activity debugging and duplicate detection
 * - RLS policy diagnostics
 * - Logging controls
 * - Future: Notifications and Users debugging
 */
const DebugPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bug className="w-8 h-8 text-red-500" />
            Debug Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive debugging tools for Super Admins to diagnose and resolve system issues.
          </p>
        </div>
        
        {/* Main Debug Interface */}
        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="rls" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              RLS Policies
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
          
          {/* Activities Debug Tab */}
          <TabsContent value="activities" className="mt-4">
            <ActivityDebugPanel />
          </TabsContent>
          
          {/* RLS Diagnostics Tab */}
          <TabsContent value="rls" className="mt-4">
            <RLSDiagnosticsPanel />
          </TabsContent>
          
          {/* Notifications Debug Tab - Placeholder for future implementation */}
          <TabsContent value="notifications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications Debug
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Notifications Debugging</h3>
                  <p className="text-muted-foreground">
                    Notification debugging tools are coming soon. This will include:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                    <li>• Notification delivery status tracking</li>
                    <li>• Template testing and validation</li>
                    <li>• User notification preferences analysis</li>
                    <li>• Delivery failure diagnosis</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Debug Tab - Placeholder for future implementation */}
          <TabsContent value="users" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Users Debug
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">User System Debugging</h3>
                  <p className="text-muted-foreground">
                    User debugging tools are coming soon. This will include:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                    <li>• User authentication status tracking</li>
                    <li>• Role and permission analysis</li>
                    <li>• Neighborhood membership diagnostics</li>
                    <li>• Profile completion status</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Logging Controls Tab */}
          <TabsContent value="logging" className="mt-4">
            <LoggingControls />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DebugPage;
