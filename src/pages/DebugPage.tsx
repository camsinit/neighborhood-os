
/**
 * Debug Page - Consolidated debugging tools for Super Admins only
 * 
 * This page combines the functionality from DebugDashboard and RLSDiagnosticsPanel
 * into a single comprehensive debugging interface accessible only to Super Admins.
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bug, Database, Mail, Users, Activity, TestTube } from 'lucide-react';
import { RLSDiagnosticsPanel } from '@/components/debug/RLSDiagnosticsPanel';
import { ActivityDebugPanel } from '@/components/debug/ActivityDebugPanel';
import { EmailTestingPanel } from '@/components/debug/EmailTestingPanel';
import LoggingControls from '@/components/debug/LoggingControls';
import OnboardingDialog from '@/components/onboarding/OnboardingDialog';
import SurveyDialog from '@/components/onboarding/SurveyDialog';
import { SkillsOnboardingDialog } from '@/components/skills/SkillsOnboardingDialog';
import { useSkillsOnboarding } from '@/hooks/useSkillsOnboarding';


/**
 * DebugPage component
 * 
 * Provides comprehensive debugging tools including:
 * - Activity debugging and duplicate detection
 * - RLS policy diagnostics
 * - Logging controls
 * - Onboarding testing
 * - Email testing for all email templates
 * - Future: Users debugging
 */
const DebugPage = () => {
  // State for onboarding testing dialogs
  const [showOnboardingTest, setShowOnboardingTest] = useState(false);
  const [showSurveyTest, setShowSurveyTest] = useState(false);
  const [showSkillsOnboardingTest, setShowSkillsOnboardingTest] = useState(false);
  
  // Skills onboarding hook for testing functions
  const { resetSkillsOnboarding } = useSkillsOnboarding();

  return (
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
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="rls" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              RLS Policies
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Emails
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
          
          {/* Testing Tab - Onboarding and other testing tools */}
          <TabsContent value="testing" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Testing Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">New User Onboarding</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Test the complete invite-to-onboarding flow: invitation landing page → profile setup → welcome.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Simulate OAuth data for consistent test flow
                        console.log('[DebugPage] Setting up OAuth-like test data');
                        localStorage.setItem('debugOAuthData', JSON.stringify({
                          firstName: 'Test',
                          lastName: 'User',
                          email: 'test@example.com',
                          profileImageUrl: 'https://via.placeholder.com/150'
                        }));
                        setShowOnboardingTest(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <TestTube className="w-4 h-4" />
                      Test Unified Onboarding Flow
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Skills Page Onboarding</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Test the Skills page first-time user experience and overlay tutorial.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSkillsOnboardingTest(true)}
                      className="flex items-center gap-2"
                    >
                      <TestTube className="w-4 h-4" />
                      Test Skills Tutorial
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        const success = await resetSkillsOnboarding();
                        if (success) {
                          alert('Skills onboarding status reset. Visit the Skills page to see the overlay.');
                        } else {
                          alert('Failed to reset skills onboarding status.');
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <TestTube className="w-4 h-4" />
                      Reset Skills Tutorial Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Email Testing Tab - Comprehensive email testing interface */}
          <TabsContent value="emails" className="mt-4">
            <EmailTestingPanel />
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
        
        {/* Testing Dialogs - Only render when needed */}
        <OnboardingDialog 
          open={showOnboardingTest} 
          onOpenChange={(open) => {
            setShowOnboardingTest(open);
            if (!open) {
              setShowSurveyTest(true);
            }
          }}
        />
        
        <SurveyDialog
          open={showSurveyTest}
          onOpenChange={setShowSurveyTest}
        />
        
        <SkillsOnboardingDialog
          open={showSkillsOnboardingTest}
          onOpenChange={setShowSkillsOnboardingTest}
          onComplete={() => setShowSkillsOnboardingTest(false)}
          
        />
        
    </div>
  );
};

export default DebugPage;
