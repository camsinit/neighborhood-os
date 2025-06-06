
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SkillProvider } from '../hooks/useSkillProviders';

/**
 * Service for handling contact revelations and notifications
 * This centralizes the logic for notifying skill providers when someone is interested
 */
export class ContactNotificationService {
  /**
   * Handles revealing contact info and sending notification to the provider
   * @param provider The skill provider whose contact is being revealed
   * @param skillTitle The title of the skill being requested
   * @param currentUserId The ID of the user requesting the skill
   */
  static async handleContactReveal(
    provider: SkillProvider, 
    skillTitle: string, 
    currentUserId: string
  ): Promise<boolean> {
    try {
      // Get the current user's profile to include their contact info in the notification
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('display_name, phone_visible, phone_number, email_visible')
        .eq('id', currentUserId)
        .single();

      const requesterName = requesterProfile?.display_name || 'A neighbor';

      // Determine requester's preferred contact method to include in notification
      let requesterContactMethod = 'app';
      let requesterContactValue = null;

      if (requesterProfile?.phone_visible && requesterProfile?.phone_number) {
        requesterContactMethod = 'phone';
        requesterContactValue = requesterProfile.phone_number;
      } else if (requesterProfile?.email_visible) {
        requesterContactMethod = 'email';
        requesterContactValue = 'Available via email';
      }

      // Create notification using the unified notification system
      const { error: notificationError } = await supabase
        .rpc('create_unified_system_notification', {
          p_user_id: provider.user_id,
          p_actor_id: currentUserId,
          p_title: `${requesterName} is interested in your ${skillTitle} skill`,
          p_content_type: 'skills',
          p_content_id: provider.user_id,
          p_notification_type: 'skills',
          p_action_type: 'respond',
          p_action_label: 'View Interest',
          p_relevance_score: 3,
          p_metadata: {
            skillTitle,
            contextType: 'skill_interest_request',
            interestedUserId: currentUserId,
            requesterContactMethod,
            requesterContactValue,
            requesterName
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        toast.error('Failed to notify the neighbor. Please try again.');
        return false;
      }

      toast.success('Contact info revealed! The neighbor has been notified.');
      return true;
    } catch (error) {
      console.error('Error handling contact reveal:', error);
      toast.error('Failed to reveal contact. Please try again.');
      return false;
    }
  }
}
