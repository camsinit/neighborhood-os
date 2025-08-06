import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to send test emails using the test-email edge function
 * This helps verify email templates are rendering correctly
 */
export const sendTestEmail = async (recipientEmail: string, testType: 'waitlist' | 'survey' = 'waitlist') => {
  try {
    // Call the test-email edge function using Supabase client
    const { data, error } = await supabase.functions.invoke('test-email', {
      body: {
        recipientEmail,
        testType
      }
    });

    if (error) {
      console.error('Error sending test email:', error);
      throw new Error(error.message || 'Failed to send test email');
    }

    console.log('Test email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Test email function error:', error);
    throw error;
  }
};

/**
 * Send a basic waitlist welcome email for testing
 */
export const sendTestWaitlistEmail = (recipientEmail: string) => {
  return sendTestEmail(recipientEmail, 'waitlist');
};

/**
 * Send a survey completion email for testing
 */
export const sendTestSurveyEmail = (recipientEmail: string) => {
  return sendTestEmail(recipientEmail, 'survey');
};