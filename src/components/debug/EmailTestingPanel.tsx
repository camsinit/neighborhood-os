/**
 * EmailTestingPanel Component
 * 
 * This component provides a comprehensive interface for testing all email types
 * that are currently sent by the application. It allows developers to send test
 * emails to themselves with sample data to verify email templates and content.
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
  CreditCard,
  Edit,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useUser } from '@supabase/auth-helpers-react';

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
 * Provides a grouped list of email test options, organized by category.
 * Users can specify a test email address and send test emails with predefined sample data.
 */
export const EmailTestingPanel: React.FC = () => {
  // Get current user for role checking
  const user = useUser();
  
  // State for the test email address input and saved email
  const [testEmailInput, setTestEmailInput] = useState('');
  const [savedTestEmail, setSavedTestEmail] = useState('');
  const [isEmailSaved, setIsEmailSaved] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  
  // State for tracking loading status of each email test
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  // State for tracking test results
  const [testResults, setTestResults] = useState<Record<string, EmailTestResult>>({});
  
  // State for email preview
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  
  // Toast notifications hook
  const { toast } = useToast();

  // Configuration for all email types that can be tested
  const emailConfigs: EmailConfig[] = [
    // Onboarding Email Series (7 separate emails)
    {
      id: 'onboarding-1',
      name: 'Onboarding #1: Community',
      description: 'Introduction to neighborhood community features and how to get started connecting with neighbors',
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
      description: 'Complete guide to creating and joining neighborhood events, including RSVP functionality and event management',
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
      description: 'How to share and request skills in the neighborhood, including setting up skill exchanges and sessions',
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
      description: 'Sharing and requesting items with neighbors, including the freebies exchange and item posting guidelines',
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
      description: 'Stay informed about neighborhood safety updates, emergency notifications, and community safety features',
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
      description: 'Connecting with your neighbors through the community directory and profile features',
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
      description: 'Advanced features and neighborhood customization options, including module preferences and settings',
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
      description: 'Welcome message for new neighborhood members with essential getting started information and next steps',
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
      description: 'Standard neighborhood invitation email with invite code and basic neighborhood information',
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
      id: 'invitation-accepted',
      name: 'Invitation Accepted',
      description: 'Notification sent to the inviter when someone accepts their invitation to join the neighborhood',
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
      description: 'AI-generated weekly neighborhood newsletter with highlights, upcoming events, and community updates',
      icon: <BookOpen className="w-5 h-5" />,
      category: 'notifications',
      functionName: 'send-weekly-summary',
      sampleData: {
        neighborhoodId: 'c0e4e442-74c1-4b34-8388-b19f7b1c6a5d', // Piedmont Ave neighborhood
        testEmail: '' // Will be filled with the test email
      }
    },
    {
      id: 'waitlist-welcome',
      name: 'Waitlist Welcome',
      description: 'Welcome email for waitlist signup with next steps and what to expect during the waitlist period',
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
      description: 'Confirmation email after completing waitlist survey with priority score and estimated timeline',
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

  // Check if user is super admin and load saved email
  useEffect(() => {
    const checkUserRoleAndLoadEmail = async () => {
      if (!user?.id) return;

      try {
        // Check if user is super admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'super_admin')
          .single();

        const isAdmin = !!roleData;
        setIsSuperAdmin(isAdmin);

        if (isAdmin) {
          // Load saved email from database for super admins
          setIsLoadingEmail(true);
          const { data: settingData } = await supabase
            .from('debug_settings')
            .select('setting_value')
            .eq('user_id', user.id)
            .eq('setting_key', 'test_email')
            .single();

          if (settingData?.setting_value) {
            setSavedTestEmail(settingData.setting_value);
            setTestEmailInput(settingData.setting_value);
            setIsEmailSaved(true);
            setIsEditingEmail(false);
          }
        } else {
          // Load from localStorage for non-admin users
          const localEmail = localStorage.getItem('debug_test_email');
          if (localEmail) {
            setSavedTestEmail(localEmail);
            setTestEmailInput(localEmail);
            setIsEmailSaved(true);
            setIsEditingEmail(false);
          }
        }
      } catch (error) {
        console.error('Error checking user role or loading email:', error);
        // Fallback to localStorage
        const localEmail = localStorage.getItem('debug_test_email');
        if (localEmail) {
          setSavedTestEmail(localEmail);
          setTestEmailInput(localEmail);
          setIsEmailSaved(true);
          setIsEditingEmail(false);
        }
      } finally {
        setIsLoadingEmail(false);
      }
    };

    checkUserRoleAndLoadEmail();
  }, [user?.id]);

  // Helper function to group emails by category
  const getEmailsByCategory = () => {
    const categories = ['onboarding', 'notifications', 'invitations', 'waitlist'];
    const grouped: Record<string, EmailConfig[]> = {};
    
    categories.forEach(category => {
      grouped[category] = emailConfigs.filter(config => config.category === category);
    });
    
    // Add any remaining categories that weren't explicitly listed
    emailConfigs.forEach(config => {
      if (!categories.includes(config.category)) {
        if (!grouped[config.category]) {
          grouped[config.category] = [];
        }
        grouped[config.category].push(config);
      }
    });
    
    // Remove empty categories
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    });
    
    return grouped;
  };

  /**
   * Function to send a test email
   * 
   * @param config - Email configuration object
   */
  const sendTestEmail = async (config: EmailConfig) => {
    // Use saved email for testing, fall back to input if not saved
    const emailToUse = isEmailSaved ? savedTestEmail : testEmailInput;
    
    if (!emailToUse?.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter and save an email address first",
        variant: "destructive"
      });
      return;
    }

    // Set loading state for this email
    setLoadingStates(prev => ({ ...prev, [config.id]: true }));

    try {
      // Prepare the data with the test email
      const emailData = {
        ...config.sampleData,
        recipientEmail: emailToUse,
        email: emailToUse // For functions that use 'email' instead of 'recipientEmail'
      };

      console.log(`[EmailTestingPanel] Starting email test process`);
      console.log(`[EmailTestingPanel] Config:`, {
        id: config.id,
        name: config.name,
        functionName: config.functionName,
        category: config.category
      });
      console.log(`[EmailTestingPanel] Sending test ${config.name} to ${emailToUse}`);
      console.log(`[EmailTestingPanel] Using function: ${config.functionName}`);
      console.log(`[EmailTestingPanel] Email data:`, emailData);
      console.log(`[EmailTestingPanel] Attempting to invoke Supabase function...`);

      // Call the appropriate edge function
      const { data, error } = await supabase.functions.invoke(config.functionName, {
        body: emailData
      });

      console.log(`[EmailTestingPanel] Function response received`);
      console.log(`[EmailTestingPanel] Response data:`, data);
      console.log(`[EmailTestingPanel] Response error:`, error);

      if (error) {
        console.error(`[EmailTestingPanel] Supabase function error:`, error);
        console.error(`[EmailTestingPanel] Error details:`, {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      if (!data) {
        console.warn(`[EmailTestingPanel] No data returned from function`);
      } else {
        console.log(`[EmailTestingPanel] Function returned data:`, data);
      }

      // Record successful test
      setTestResults(prev => ({
        ...prev,
        [config.id]: {
          success: true,
          message: `Test email sent successfully to ${emailToUse}`,
          timestamp: new Date()
        }
      }));

      console.log(`[EmailTestingPanel] ✅ Email test completed successfully for ${config.name}`);

      toast({
        title: "Email Sent!",
        description: `${config.name} test email sent to ${emailToUse}`,
      });

    } catch (error: any) {
      console.error(`[EmailTestingPanel] ❌ Error sending ${config.name}:`, error);
      console.error(`[EmailTestingPanel] Error type:`, typeof error);
      console.error(`[EmailTestingPanel] Error stack:`, error.stack);
      
      // Log additional error details if available
      if (error.message) {
        console.error(`[EmailTestingPanel] Error message:`, error.message);
      }
      if (error.code) {
        console.error(`[EmailTestingPanel] Error code:`, error.code);
      }
      if (error.status) {
        console.error(`[EmailTestingPanel] HTTP status:`, error.status);
      }
      
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
   * Function to preview an email (renders without sending)
   * 
   * @param config - Email configuration object
   */
  const previewEmail = async (config: EmailConfig) => {
    // Use saved email for testing, fall back to input if not saved
    const emailToUse = isEmailSaved ? savedTestEmail : testEmailInput;
    
    if (!emailToUse?.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter and save an email address first",
        variant: "destructive"
      });
      return;
    }

    // Set loading state for this email
    setLoadingStates(prev => ({ ...prev, [config.id]: true }));

    try {
      // Prepare the data with the test email and preview flag
      const emailData = {
        ...config.sampleData,
        recipientEmail: emailToUse,
        email: emailToUse,
        testEmail: emailToUse,
        previewOnly: true // Special flag for preview mode
      };

      console.log(`[EmailTestingPanel] Starting email preview for ${config.name}`);
      console.log(`[EmailTestingPanel] Preview data:`, emailData);

      // Call the appropriate edge function with preview flag
      const { data, error } = await supabase.functions.invoke(config.functionName, {
        body: emailData
      });

      console.log(`[EmailTestingPanel] Preview response:`, { data, error });

      if (error) {
        console.error(`[EmailTestingPanel] Preview error:`, error);
        throw error;
      }

      if (data?.html) {
        // Show the rendered HTML in preview modal
        setPreviewHtml(data.html);
        setPreviewTitle(config.name);
        setIsPreviewOpen(true);
        
        console.log(`[EmailTestingPanel] ✅ Email preview loaded successfully for ${config.name}`);
        
        toast({
          title: "Preview Ready!",
          description: `${config.name} preview loaded`,
        });
      } else {
        throw new Error('No HTML content returned from preview');
      }

    } catch (error: any) {
      console.error(`[EmailTestingPanel] ❌ Error previewing ${config.name}:`, error);
      
      toast({
        title: "Preview Failed",
        description: `Failed to preview ${config.name}: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [config.id]: false }));
    }
  };

  // Handle saving the email address
  const handleSaveEmail = async () => {
    if (!testEmailInput?.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmailInput.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    const emailToSave = testEmailInput.trim();

    try {
      if (isSuperAdmin && user?.id) {
        // Save to database for super admins
        const { error } = await supabase
          .from('debug_settings')
          .upsert({
            user_id: user.id,
            setting_key: 'test_email',
            setting_value: emailToSave
          }, {
            onConflict: 'user_id,setting_key'
          });

        if (error) throw error;

        toast({
          title: "Email Saved!",
          description: `Test emails will be sent to ${emailToSave} (saved to database)`,
        });
      } else {
        // Save to localStorage for non-admin users
        localStorage.setItem('debug_test_email', emailToSave);
        
        toast({
          title: "Email Saved!",
          description: `Test emails will be sent to ${emailToSave} (saved locally)`,
        });
      }

      setSavedTestEmail(emailToSave);
      setIsEmailSaved(true);
      setIsEditingEmail(false);
    } catch (error) {
      console.error('Error saving email:', error);
      
      // Fallback to localStorage
      localStorage.setItem('debug_test_email', emailToSave);
      setSavedTestEmail(emailToSave);
      setIsEmailSaved(true);
      setIsEditingEmail(false);
      
      toast({
        title: "Email Saved!",
        description: `Test emails will be sent to ${emailToSave} (saved locally as fallback)`,
      });
    }
  };

  // Handle editing the email address
  const handleEditEmail = () => {
    setIsEditingEmail(true);
    setTestEmailInput(savedTestEmail);
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setTestEmailInput(savedTestEmail);
    setIsEditingEmail(false);
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
            {/* Email input section with save/edit functionality */}
            <div>
              <Label htmlFor="test-email">Test Email Address</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 relative">
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="your-email@example.com"
                    value={isEditingEmail ? testEmailInput : savedTestEmail}
                    onChange={(e) => setTestEmailInput(e.target.value)}
                    readOnly={!isEditingEmail}
                    className={cn(
                      "transition-colors",
                      !isEditingEmail && "bg-muted cursor-default",
                      isEmailSaved && !isEditingEmail && "pr-10"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isEditingEmail) {
                        handleSaveEmail();
                      }
                      if (e.key === 'Escape' && isEditingEmail && isEmailSaved) {
                        handleCancelEdit();
                      }
                    }}
                  />
                  
                  {/* Check mark icon when email is saved */}
                  {isEmailSaved && !isEditingEmail && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  {isEditingEmail ? (
                    <>
                      <Button
                        onClick={handleSaveEmail}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Save
                      </Button>
                      {isEmailSaved && (
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={handleEditEmail}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Testing List - Grouped by Categories */}
      <div className="space-y-6">
        {Object.entries(getEmailsByCategory()).map(([category, configs]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 capitalize">
                <Mail className="w-5 h-5" />
                {category === 'other' ? 'Other Email Types' : `${category} Emails`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {configs.length} email template{configs.length !== 1 ? 's' : ''} in this category
              </p>
            </CardHeader>
            <CardContent>
              {/* Category email list header */}
              <div className="border-b pb-3 mb-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                  <div className="col-span-4">Email Type</div>
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2">Action</div>
                </div>
              </div>

              {/* Category email list items */}
              <div className="space-y-2">
                {configs.map((config) => (
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

                    {/* Extended Description */}
                    <div className="col-span-6">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {config.description}
                      </p>
                    </div>

                    {/* Action & Status */}
                    <div className="col-span-2 flex items-center gap-2">
                      {/* Preview button - only show for weekly summary */}
                      {config.id === 'weekly-summary' && (
                        <Button
                          onClick={() => previewEmail(config)}
                          disabled={loadingStates[config.id] || (!isEmailSaved && !testEmailInput?.trim())}
                          size="sm"
                          variant="ghost"
                          className="flex items-center gap-1"
                        >
                          {loadingStates[config.id] ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                          Preview
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => sendTestEmail(config)}
                        disabled={loadingStates[config.id] || (!isEmailSaved && !testEmailInput?.trim())}
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
                              <div 
                                className="w-4 h-4 text-red-600 hover:text-gray-500 cursor-pointer transition-colors duration-200" 
                                onClick={() => {
                                  // Remove this specific test result when clicked
                                  setTestResults(prev => {
                                    const updated = { ...prev };
                                    delete updated[config.id];
                                    return updated;
                                  });
                                }}
                                title="Click to remove"
                              >
                                <XCircle className="w-full h-full" />
                              </div>
                           )}
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state for category */}
              {configs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No email templates in this category</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Overall empty state */}
        {Object.keys(getEmailsByCategory()).length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No email configurations found</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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

      {/* Email Preview Sheet */}
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent className="w-[80vw] max-w-4xl">
          <SheetHeader>
            <SheetTitle>Email Preview: {previewTitle}</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 h-[calc(100vh-120px)] overflow-auto border rounded-lg bg-white">
            {previewHtml && (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EmailTestingPanel;
