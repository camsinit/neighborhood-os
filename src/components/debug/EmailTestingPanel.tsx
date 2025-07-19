/**
 * EmailTestingPanel Component
 * 
 * This component provides a comprehensive interface for testing all email types
 * that are currently sent by the application. It allows developers to send test
 * emails to themselves with sample data to verify email templates and content.
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar, 
  Heart, 
  Package, 
  Shield,
  User,
  Settings,
  BookOpen,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Interface for email test results
interface EmailTestResult {
  success: boolean;
  message: string;
  timestamp: Date;
}

// Interface for email configuration
interface EmailConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'onboarding' | 'invitations' | 'notifications' | 'waitlist';
  functionName: string;
  sampleData: any;
  badge?: string;
}

/**
 * EmailTestingPanel Component
 * 
 * Provides a grid of email test cards, each representing a different email type
 * that can be sent by the application. Users can specify a test email address
 * and send test emails with predefined sample data.
 */
export const EmailTestingPanel: React.FC = () => {
  // State for the test email address
  const [testEmail, setTestEmail] = useState('');
  
  // State for tracking loading status of each email test
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  // State for tracking test results
  const [testResults, setTestResults] = useState<Record<string, EmailTestResult>>({});
  
  // Toast notifications hook
  const { toast } = useToast();

  // Configuration for all email types that can be tested
  const emailConfigs: EmailConfig[] = [
    // Onboarding Email Series (7 separate emails)
    {
      id: 'onboarding-1',
      name: 'Onboarding #1: Community',
      description: 'Introduction to neighborhood community features',
      icon: <Users className="w-5 h-5" />,
      category: 'onboarding',
      functionName: 'send-onboarding-email',
      badge: 'Series 1/7',
      sampleData: {
        recipientEmail: '', // Will be filled with testEmail
        firstName: 'Alex',
        neighborhoodName: 'Maple Street Neighborhood',
        emailNumber: 1
      }
    },
    {
      id: 'onboarding-2',
      name: 'Onboarding #2: Events',
      description: 'Guide to creating and joining neighborhood events',
      icon: <Calendar className="w-5 h-5" />,
      category: 'onboarding',
      functionName: 'send-onboarding-email',
      badge: 'Series 2/7',
      sampleData: {
        recipientEmail: '',
        firstName: 'Alex',
        neighborhoodName: 'Maple Street Neighborhood',
        emailNumber: 2
      }
    },
    {
      id: 'onboarding-3',
      name: 'Onboarding #3: Skills',
      description: 'How to share and request skills in the neighborhood',
      icon: <Heart className="w-5 h-5" />,
      category: 'onboarding',
      functionName: 'send-onboarding-email',
      badge: 'Series 3/7',
      sampleData: {
        recipientEmail: '',
        firstName: 'Alex',
        neighborhoodName: 'Maple Street Neighborhood',
        emailNumber: 3
      }
    },
    {
      id: 'onboarding-4',
      name: 'Onboarding #4: Goods',
      description: 'Sharing and requesting items with neighbors',
      icon: <Package className="w-5 h-5" />,
      category: 'onboarding',
      functionName: 'send-onboarding-email',
      badge: 'Series 4/7',
      sampleData: {
        recipientEmail: '',
        firstName: 'Alex',
        neighborhoodName: 'Maple Street Neighborhood',
        emailNumber: 4
      }
    },
    {
      id: 'onboarding-5',
      name: 'Onboarding #5: Safety',
      description: 'Stay informed about neighborhood safety updates',
      icon: <Shield className="w-5 h-5" />,
      category: 'onboarding',
      functionName: 'send-onboarding-email',
      badge: 'Series 5/7',
      sampleData: {
        recipientEmail: '',
        firstName: 'Alex',
        neighborhoodName: 'Maple Street Neighborhood',
        emailNumber: 5
      }
    },
    {
      id: 'onboarding-6',
      name: 'Onboarding #6: Directory',
      description: 'Connecting with your neighbors',
      icon: <User className="w-5 h-5" />,
      category: 'onboarding',
      functionName: 'send-onboarding-email',
      badge: 'Series 6/7',
      sampleData: {
        recipientEmail: '',
        firstName: 'Alex',
        neighborhoodName: 'Maple Street Neighborhood',
        emailNumber: 6
      }
    },
    {
      id: 'onboarding-7',
      name: 'Onboarding #7: Modules',
      description: 'Advanced features and neighborhood customization',
      icon: <Settings className="w-5 h-5" />,
      category: 'onboarding',
      functionName: 'send-onboarding-email',
      badge: 'Series 7/7',
      sampleData: {
        recipientEmail: '',
        firstName: 'Alex',
        neighborhoodName: 'Maple Street Neighborhood',
        emailNumber: 7
      }
    },
    // Other Email Types
    {
      id: 'welcome',
      name: 'Welcome Email',
      description: 'Welcome message for new neighborhood members',
      icon: <Heart className="w-5 h-5" />,
      category: 'notifications',
      functionName: 'send-welcome-email',
      sampleData: {
        recipientEmail: '',
        firstName: 'Alex',
        neighborhoodName: 'Maple Street Neighborhood'
      }
    },
    {
      id: 'invitation',
      name: 'Basic Invitation',
      description: 'Standard neighborhood invitation email',
      icon: <Mail className="w-5 h-5" />,
      category: 'invitations',
      functionName: 'send-invitation',
      sampleData: {
        recipientEmail: '',
        inviterName: 'Jordan Smith',
        neighborhoodName: 'Maple Street Neighborhood',
        inviteCode: 'TEST123'
      }
    },
    {
      id: 'neighbor-invite',
      name: 'Personalized Neighbor Invite',
      description: 'Personalized invitation from an existing neighbor',
      icon: <Users className="w-5 h-5" />,
      category: 'invitations',
      functionName: 'send-neighbor-invite',
      sampleData: {
        recipientEmail: '',
        inviterName: 'Jordan Smith',
        neighborhoodName: 'Maple Street Neighborhood',
        personalMessage: 'Hi! I think you\'d love being part of our neighborhood community. We have great events and everyone is really friendly!',
        inviteCode: 'TEST123'
      }
    },
    {
      id: 'invitation-accepted',
      name: 'Invitation Accepted',
      description: 'Notification when someone accepts an invitation',
      icon: <CheckCircle className="w-5 h-5" />,
      category: 'notifications',
      functionName: 'send-invitation-accepted',
      sampleData: {
        recipientEmail: '',
        inviterName: 'Jordan Smith',
        newMemberName: 'Alex Johnson',
        neighborhoodName: 'Maple Street Neighborhood'
      }
    },
    {
      id: 'weekly-summary',
      name: 'Weekly Summary',
      description: 'AI-generated weekly neighborhood newsletter',
      icon: <BookOpen className="w-5 h-5" />,
      category: 'notifications',
      functionName: 'send-weekly-summary',
      sampleData: {
        recipientEmail: '',
        neighborhoodName: 'Maple Street Neighborhood',
        weekOf: new Date().toISOString().split('T')[0]
      }
    },
    {
      id: 'waitlist-welcome',
      name: 'Waitlist Welcome',
      description: 'Welcome email for waitlist signup',
      icon: <MessageSquare className="w-5 h-5" />,
      category: 'waitlist',
      functionName: 'join-waitlist',
      sampleData: {
        email: '' // Will be filled with testEmail
      }
    },
    {
      id: 'survey-confirmation',
      name: 'Survey Confirmation',
      description: 'Confirmation email after completing waitlist survey',
      icon: <CreditCard className="w-5 h-5" />,
      category: 'waitlist',
      functionName: 'save-waitlist-survey',
      sampleData: {
        email: '', // Will be filled with testEmail
        firstName: 'Alex',
        lastName: 'Johnson',
        city: 'Portland',
        state: 'OR',
        neighborhoodName: 'Maple Street Neighborhood',
        neighborsToOnboard: 15,
        aiCodingExperience: 'Intermediate',
        openSourceInterest: 'Very Interested'
      }
    }
  ];

  /**
   * Function to send a test email
   * 
   * @param config - Email configuration object
   */
  const sendTestEmail = async (config: EmailConfig) => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a test email address first.",
        variant: "destructive",
      });
      return;
    }

    // Set loading state for this email
    setLoadingStates(prev => ({ ...prev, [config.id]: true }));

    try {
      // Prepare the data with the test email
      const emailData = {
        ...config.sampleData,
        recipientEmail: testEmail,
        email: testEmail // For functions that use 'email' instead of 'recipientEmail'
      };

      console.log(`[EmailTestingPanel] Sending test ${config.name} to ${testEmail}`);
      console.log(`[EmailTestingPanel] Using function: ${config.functionName}`);
      console.log(`[EmailTestingPanel] Email data:`, emailData);

      // Call the appropriate edge function
      const { data, error } = await supabase.functions.invoke(config.functionName, {
        body: emailData
      });

      if (error) {
        throw error;
      }

      // Record successful test
      setTestResults(prev => ({
        ...prev,
        [config.id]: {
          success: true,
          message: `Test email sent successfully to ${testEmail}`,
          timestamp: new Date()
        }
      }));

      toast({
        title: "Email Sent!",
        description: `${config.name} test email sent to ${testEmail}`,
      });

    } catch (error: any) {
      console.error(`[EmailTestingPanel] Error sending ${config.name}:`, error);
      
      // Record failed test
      setTestResults(prev => ({
        ...prev,
        [config.id]: {
          success: false,
          message: error.message || 'Failed to send test email',
          timestamp: new Date()
        }
      }));

      toast({
        title: "Email Failed",
        description: `Failed to send ${config.name}: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [config.id]: false }));
    }
  };

  /**
   * Get the appropriate color for category badges
   */
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'onboarding': return 'bg-blue-100 text-blue-800';
      case 'invitations': return 'bg-green-100 text-green-800';
      case 'notifications': return 'bg-purple-100 text-purple-800';
      case 'waitlist': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Filter emails by category for organized display
   */
  const getEmailsByCategory = (category: string) => {
    return emailConfigs.filter(config => config.category === category);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Testing Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="your-email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter your email address to receive test emails. All emails will be sent with sample data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Testing List - Converted from cards to list format */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Testing
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test all email templates by sending them to your specified email address
          </p>
        </CardHeader>
        <CardContent>
          {/* Email testing list header */}
          <div className="border-b pb-3 mb-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
              <div className="col-span-4">Email Type</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Action</div>
            </div>
          </div>

          {/* Email testing list items */}
          <div className="space-y-2">
            {emailConfigs.map((config) => (
              <div
                key={config.id}
                className="grid grid-cols-12 gap-4 items-center py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
              >
                {/* Email Type */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10">
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{config.name}</h3>
                    {config.badge && (
                      <Badge variant="outline" className="text-xs mt-1">{config.badge}</Badge>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-3">
                  <Badge className={getCategoryColor(config.category)} variant="secondary">
                    {config.category}
                  </Badge>
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {config.description}
                  </p>
                </div>

                {/* Action & Status */}
                <div className="col-span-2 flex items-center gap-2">
                  <Button
                    onClick={() => sendTestEmail(config)}
                    disabled={loadingStates[config.id] || !testEmail}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {loadingStates[config.id] ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    Test
                  </Button>
                  
                  {/* Status indicator */}
                  {testResults[config.id] && (
                    <div className="flex items-center" title={testResults[config.id].success ? "Sent successfully" : "Failed to send"}>
                      {testResults[config.id].success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty state if no emails */}
          {emailConfigs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No email configurations found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results Summary */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(testResults).map(([emailId, result]) => {
                const config = emailConfigs.find(c => c.id === emailId);
                return (
                  <div key={emailId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">{config?.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailTestingPanel;
