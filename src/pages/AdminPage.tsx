/**
 * AdminPage - Neighborhood Administration Dashboard
 * 
 * This page provides administrative controls for neighborhood admins and stewards.
 * It includes 6 main sections:
 * - Dashboard: Overview stats and activity KPIs
 * - Members: Member directory and role management
 * - Content: Content moderation and community guidelines
 * - Invitations: Invitation management and analytics
 * - Settings: Neighborhood configuration (admin only)
 * - Reports: Usage analytics and exports
 * 
 * Access control:
 * - Only admins and stewards can access this page
 * - Settings tab is read-only for stewards
 */

import React, { useState } from 'react';
import { useCanAccessAdminPage } from '@/hooks/useCanAccessAdminPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, FileText, Mail, Settings, TrendingUp, Shield } from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminMembers from '@/components/admin/AdminMembers';
import AdminContent from '@/components/admin/AdminContent';
import AdminInvitations from '@/components/admin/AdminInvitations';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminReports from '@/components/admin/AdminReports';

const AdminPage = () => {
  // Check if user has admin/steward access
  const { canAccess, isAdmin, isSteward, isLoading, role } = useCanAccessAdminPage();
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Access denied
  if (!canAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the Admin page. 
              Only neighborhood admins and stewards can view this section.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">
              Neighborhood Admin
            </h1>
          </div>
          <p className="text-gray-600">
            {isAdmin 
              ? "Manage your neighborhood as an administrator" 
              : "Support your neighborhood as a steward"
            }
            {role && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            )}
          </p>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Invitations</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <AdminMembers />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <AdminContent />
          </TabsContent>

          <TabsContent value="invitations" className="space-y-6">
            <AdminInvitations />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AdminSettings isReadOnly={!isAdmin} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <AdminReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;