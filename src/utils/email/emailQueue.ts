/**
 * Email Queue Utilities
 * 
 * Helper functions for managing the email queue system
 */

import { supabase } from "@/integrations/supabase/client";

export interface EmailQueueEntry {
  recipient_email: string;
  template_type: string;
  template_data: Record<string, any>;
  scheduled_for?: Date;
  neighborhood_id?: string;
  user_id?: string;
}

/**
 * Queue a single email for sending
 */
export const queueEmail = async (email: EmailQueueEntry): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`[emailQueue] Queueing email: ${email.template_type} to ${email.recipient_email}`);

    const { error } = await supabase
      .from('email_queue')
      .insert({
        recipient_email: email.recipient_email,
        template_type: email.template_type,
        template_data: email.template_data,
        scheduled_for: email.scheduled_for?.toISOString() || new Date().toISOString(),
        neighborhood_id: email.neighborhood_id || null,
        user_id: email.user_id || null
      });

    if (error) {
      console.error('[emailQueue] Error queueing email:', error);
      return { success: false, error: error.message };
    }

    console.log(`[emailQueue] Successfully queued email: ${email.template_type}`);
    return { success: true };

  } catch (error) {
    console.error('[emailQueue] Unexpected error queueing email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Queue multiple emails for sending
 */
export const queueEmails = async (emails: EmailQueueEntry[]): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`[emailQueue] Queueing ${emails.length} emails`);

    const emailRecords = emails.map(email => ({
      recipient_email: email.recipient_email,
      template_type: email.template_type,
      template_data: email.template_data,
      scheduled_for: email.scheduled_for?.toISOString() || new Date().toISOString(),
      neighborhood_id: email.neighborhood_id || null,
      user_id: email.user_id || null
    }));

    const { error } = await supabase
      .from('email_queue')
      .insert(emailRecords);

    if (error) {
      console.error('[emailQueue] Error queueing emails:', error);
      return { success: false, error: error.message };
    }

    console.log(`[emailQueue] Successfully queued ${emails.length} emails`);
    return { success: true };

  } catch (error) {
    console.error('[emailQueue] Unexpected error queueing emails:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Create the 7-part onboarding email series
 * This schedules emails to be sent over the course of several weeks
 */
export const queueOnboardingSeries = async (
  userEmail: string,
  firstName: string,
  neighborhoodName: string,
  neighborhoodId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`[emailQueue] Creating onboarding series for ${userEmail}`);

    const baseTemplateData = {
      firstName,
      neighborhoodName
    };

    // Create the 7-part onboarding series with increasing intervals
    const onboardingEmails: EmailQueueEntry[] = [
      {
        recipient_email: userEmail,
        template_type: 'onboarding_1',
        template_data: { ...baseTemplateData, emailNumber: 1 },
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        neighborhood_id: neighborhoodId,
        user_id: userId
      },
      {
        recipient_email: userEmail,
        template_type: 'onboarding_2',
        template_data: { ...baseTemplateData, emailNumber: 2 },
        scheduled_for: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        neighborhood_id: neighborhoodId,
        user_id: userId
      },
      {
        recipient_email: userEmail,
        template_type: 'onboarding_3',
        template_data: { ...baseTemplateData, emailNumber: 3 },
        scheduled_for: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        neighborhood_id: neighborhoodId,
        user_id: userId
      },
      {
        recipient_email: userEmail,
        template_type: 'onboarding_4',
        template_data: { ...baseTemplateData, emailNumber: 4 },
        scheduled_for: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        neighborhood_id: neighborhoodId,
        user_id: userId
      },
      {
        recipient_email: userEmail,
        template_type: 'onboarding_5',
        template_data: { ...baseTemplateData, emailNumber: 5 },
        scheduled_for: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
        neighborhood_id: neighborhoodId,
        user_id: userId
      },
      {
        recipient_email: userEmail,
        template_type: 'onboarding_6',
        template_data: { ...baseTemplateData, emailNumber: 6 },
        scheduled_for: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        neighborhood_id: neighborhoodId,
        user_id: userId
      },
      {
        recipient_email: userEmail,
        template_type: 'onboarding_7',
        template_data: { ...baseTemplateData, emailNumber: 7 },
        scheduled_for: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        neighborhood_id: neighborhoodId,
        user_id: userId
      }
    ];

    return await queueEmails(onboardingEmails);

  } catch (error) {
    console.error('[emailQueue] Error creating onboarding series:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Trigger the email queue processor
 * This calls the edge function to process pending emails
 */
export const triggerEmailProcessor = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('[emailQueue] Triggering email processor');

    const { data, error } = await supabase.functions.invoke('process-email-queue', {
      body: { trigger: 'manual' }
    });

    if (error) {
      console.error('[emailQueue] Error triggering processor:', error);
      return { success: false, error: error.message };
    }

    console.log('[emailQueue] Email processor triggered successfully:', data);
    return { success: true };

  } catch (error) {
    console.error('[emailQueue] Unexpected error triggering processor:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};