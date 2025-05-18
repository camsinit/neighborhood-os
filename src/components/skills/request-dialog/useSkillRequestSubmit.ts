
/**
 * Hook for handling skill request submission
 * Updated to support multi-provider requests
 */
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { TimeSlot } from "../contribution/TimeSlotSelector";
import { supabase } from "@/integrations/supabase/client";
import { prepareTimeSlots } from "@/utils/timeslotUtils";
import { Json } from "@/integrations/supabase/types"; // Import the Json type from Supabase types
import refreshEvents from "@/utils/refreshEvents";

/**
 * Form data structure for skill requests
 */
export interface SkillRequestFormData {
  description: string;
  availability: 'weekdays' | 'weekends' | 'both';
  timePreference: ('morning' | 'afternoon' | 'evening')[];
}

/**
 * Custom hook for handling the skill request submission process
 * Updated to support multi-provider requests when providerId is undefined
 */
export const useSkillRequestSubmit = (
  skillId: string,
  providerId?: string, // Now optional for multi-provider requests
  onClose: () => void
) => {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks
  const user = useUser();
  const queryClient = useQueryClient();

  /**
   * Submit a skill request with selected time slots
   * Now supports multi-provider requests when providerId is undefined
   */
  const submitSkillRequest = async (
    data: SkillRequestFormData,
    selectedTimeSlots: TimeSlot[]
  ) => {
    // Validate user is logged in
    if (!user) {
      toast.error('You must be logged in to request skills');
      return;
    }

    // Log input time slots array for debugging
    console.log("[submitSkillRequest] Starting request submission:", {
      skillId,
      providerId: providerId || 'MULTI_PROVIDER', // Log if this is a multi-provider request
      requesterId: user.id,
      formData: JSON.stringify(data, null, 2),
      timeSlots: JSON.stringify(selectedTimeSlots, null, 2)
    });
    
    // Validate we have at least one time slot
    if (!selectedTimeSlots.length) {
      toast.error('Please select at least one date and time preference');
      return;
    }

    // Start submission process
    setIsSubmitting(true);
    try {
      // Prepare data for RPC call - this ensures compatibility with JSON types
      const preparedTimeSlots = prepareTimeSlots(selectedTimeSlots);
      
      console.log("[submitSkillRequest] Prepared time slots for RPC:", preparedTimeSlots);
      
      // Convert form data to a simple Record object that Supabase can serialize
      // This fixes the TypeScript error by ensuring our object has the right structure
      const formDataForRpc: Record<string, Json> = {
        description: data.description,
        availability: data.availability,
        timePreference: data.timePreference
      };
      
      // Determine the status based on whether this is a multi-provider or specific provider request
      const initialStatus = providerId ? 'pending_provider_times' : 'open_for_providers';
      
      // Create the skill session
      const { data: session, error } = await supabase
        .from('skill_sessions')
        .insert({
          skill_id: skillId,
          provider_id: providerId, // This can be null for multi-provider requests
          requester_id: user.id,
          status: initialStatus,
          requester_availability: formDataForRpc,
        })
        .select();

      if (error) {
        console.error("[submitSkillRequest] Error creating skill session:", error);
        throw error;
      }
      
      console.log("[submitSkillRequest] Skill session created:", session);
      
      // Get the session ID from the result
      const sessionId = session?.[0]?.id;
      if (!sessionId) {
        throw new Error("Failed to get session ID from the created session");
      }
      
      // Now insert time slots for the session
      const timeSlotObjects = selectedTimeSlots.map(slot => {
        // For each date, create entries for each selected time preference
        const timeSlots = [];
        const dateString = typeof slot.date === 'string' ? slot.date : slot.date.toISOString().split('T')[0];
        
        // Create a time slot for each selected preference (morning, afternoon, evening)
        for (const pref of slot.preferences) {
          let timeString;
          switch(pref) {
            case 'morning':
              timeString = 'T09:00:00.000Z'; // 9 AM
              break;
            case 'afternoon':
              timeString = 'T13:00:00.000Z'; // 1 PM
              break;
            case 'evening':
              timeString = 'T18:00:00.000Z'; // 6 PM
              break;
            default:
              timeString = 'T12:00:00.000Z'; // Default to noon
          }
          
          timeSlots.push({
            session_id: sessionId,
            proposed_time: dateString + timeString
          });
        }
        
        return timeSlots;
      }).flat();
      
      // Insert the time slots
      const { error: timeSlotError } = await supabase
        .from('skill_session_time_slots')
        .insert(timeSlotObjects);
        
      if (timeSlotError) {
        console.error("[submitSkillRequest] Error inserting time slots:", timeSlotError);
        throw timeSlotError;
      }
      
      // Show success message based on request type
      if (providerId) {
        toast.success('Skill request submitted successfully', {
          description: 'The provider will be notified of your request.'
        });
      } else {
        toast.success('Skill request submitted successfully', {
          description: 'Your request has been sent to all matching providers.'
        });
      }
      
      // Invalidate queries and emit events to refresh UI
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['skill-sessions'] });
      
      refreshEvents.emit('skill-request-created');
      refreshEvents.emit('skills-updated');
      refreshEvents.emit('notification-created');
      
      onClose();
    } catch (error: any) {
      console.error('[submitSkillRequest] Error submitting skill request:', error);
      
      // Enhanced error logging
      console.error('[submitSkillRequest] Error context:', {
        skillId,
        providerId: providerId || 'MULTI_PROVIDER',
        requesterId: user?.id,
        errorMessage: error.message,
        errorCode: error.code
      });
      
      toast.error('Request submission failed', {
        description: error.message || 'Failed to submit skill request. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    isSubmitting, 
    submitSkillRequest 
  };
};
