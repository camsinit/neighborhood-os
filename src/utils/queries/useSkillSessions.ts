
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SkillSession, TimeSlot, SkillSessionStatus } from "@/types/skillSessions";
import { useUser } from "@supabase/auth-helpers-react";
import { Database } from "@/integrations/supabase/types";

// Define interface for availability data
interface AvailabilityData {
  weekday: boolean;
  weekend: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

// Type for the Supabase response
type SkillSessionResponse = Database['public']['Tables']['skill_sessions']['Row'] & {
  skill: {
    title: string;
    description: string | null;
    request_type: string;
    skill_category: string;
  } | null;
  requester: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  provider: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export const useSkillSessions = () => {
  const user = useUser();

  return useQuery({
    queryKey: ['skill-sessions', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch sessions with type annotation
      const { data: sessions, error: sessionsError } = await supabase
        .from('skill_sessions')
        .select(`
          *,
          skill:skill_id (
            title,
            description,
            request_type,
            skill_category
          ),
          requester:requester_id (
            display_name,
            avatar_url
          ),
          provider:provider_id (
            display_name,
            avatar_url
          )
        `)
        .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`);

      if (sessionsError) throw sessionsError;

      // Fetch time slots for each session
      const sessionIds = (sessions as SkillSessionResponse[]).map(s => s.id);
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from('skill_session_time_slots')
        .select('*')
        .in('session_id', sessionIds);

      if (timeSlotsError) throw timeSlotsError;

      // Group time slots by session
      const timeSlotsBySession = timeSlots.reduce((acc, slot) => {
        if (!acc[slot.session_id]) {
          acc[slot.session_id] = [];
        }
        acc[slot.session_id].push(slot);
        return acc;
      }, {} as Record<string, TimeSlot[]>);

      // Transform the sessions data to match our SkillSession type
      const transformedSessions: SkillSession[] = (sessions as SkillSessionResponse[]).map((session) => {
        // Get availability data with default values
        const defaultAvailability: AvailabilityData = {
          weekday: false,
          weekend: false,
          morning: false,
          afternoon: false,
          evening: false
        };

        // Parse the requester_availability safely
        let availability: AvailabilityData;
        try {
          const parsed = typeof session.requester_availability === 'string' 
            ? JSON.parse(session.requester_availability)
            : session.requester_availability;
            
          availability = {
            weekday: Boolean(parsed?.weekday),
            weekend: Boolean(parsed?.weekend),
            morning: Boolean(parsed?.morning),
            afternoon: Boolean(parsed?.afternoon),
            evening: Boolean(parsed?.evening)
          };
        } catch (e) {
          console.error('Error parsing availability:', e);
          availability = defaultAvailability;
        }

        return {
          ...session,
          requester_availability: availability,
          created_at: session.created_at,
          updated_at: session.updated_at,
          expires_at: session.expires_at,
          event_id: session.event_id || undefined,
          id: session.id,
          skill_id: session.skill_id,
          requester_id: session.requester_id,
          provider_id: session.provider_id,
          status: session.status as SkillSessionStatus,
          skill: session.skill,
          requester: session.requester,
          provider: session.provider
        };
      });

      return {
        sessions: transformedSessions,
        timeSlots: timeSlotsBySession,
      };
    },
    enabled: !!user,
  });
};
