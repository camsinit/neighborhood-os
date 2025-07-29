
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
import { SuperAdminNeighborhoodCreation } from '@/components/debug/SuperAdminNeighborhoodCreation';
import OnboardingDialog from '@/components/onboarding/OnboardingDialog';
import SurveyDialog from '@/components/onboarding/SurveyDialog';
import { SkillsOnboardingDialog } from '@/components/skills/SkillsOnboardingDialog';
import { useSkillsOnboarding } from '@/hooks/useSkillsOnboarding';
import { SuperAdminNeighborhoodSelector } from '@/components/layout/sidebar/SuperAdminNeighborhoodSelector';
import { WelcomePopover } from '@/components/onboarding/WelcomePopover';


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
  const [showWelcomePopoverTest, setShowWelcomePopoverTest] = useState(false);
  
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
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Neighborhoods
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Debug Tools
            </TabsTrigger>
          </TabsList>
          
          {/* Combined Debug Tools Tab */}
          <TabsContent value="debug" className="mt-4 space-y-6">
            {/* Activities Debug Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activities Debug
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityDebugPanel />
              </CardContent>
            </Card>
            
            {/* RLS Diagnostics Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  RLS Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RLSDiagnosticsPanel />
              </CardContent>
            </Card>
            
            {/* Logging Controls Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="w-5 h-5" />
                  Logging Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LoggingControls embedded />
              </CardContent>
            </Card>
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
                    <Button 
                      variant="outline" 
                      onClick={() => setShowWelcomePopoverTest(true)}
                      className="flex items-center gap-2"
                    >
                      <TestTube className="w-4 h-4" />
                      Test Welcome Popover
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
          
          {/* Neighborhoods Tab - Enhanced Super Admin Tools */}
          <TabsContent value="users" className="mt-4 space-y-6">
            {/* Neighborhood Switcher */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Neighborhood Switcher
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="text-lg font-medium mb-2">Current Neighborhood</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Switch between different neighborhoods to debug community-specific issues, view neighborhood data, and test features across communities.
                  </p>
                  <SuperAdminNeighborhoodSelector />
                </div>
              </CardContent>
            </Card>
            
            {/* Super Admin Neighborhood Creation */}
            <SuperAdminNeighborhoodCreation />
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
        
        {/* Welcome Popover for direct UI testing and editing */}
        <WelcomePopover
          isVisible={showWelcomePopoverTest}
          onDismiss={() => setShowWelcomePopoverTest(false)}
        />
        
    </div>
  );
};

export default DebugPage;
