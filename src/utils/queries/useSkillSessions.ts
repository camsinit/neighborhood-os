
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SkillSession, TimeSlot, SkillSessionStatus } from "@/types/skillSessions";
import { useUser } from "@supabase/auth-helpers-react";

// Define an interface for the raw data from Supabase
interface RawSession {
  id: string;
  skill_id: string;
  requester_id: string;
  provider_id: string;
  requester_availability: string | null; // JSON string from database
  status: SkillSessionStatus;
  created_at: string;
  updated_at: string;
  expires_at: string;
  event_id?: string;
}

export const useSkillSessions = () => {
  const user = useUser();

  return useQuery({
    queryKey: ['skill-sessions', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch sessions
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
      const sessionIds = sessions.map(s => s.id);
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
      const transformedSessions: SkillSession[] = sessions.map((session: RawSession) => {
        // Parse the JSON string into an object, with default values if parsing fails
        let availability;
        try {
          availability = JSON.parse(session.requester_availability || '{}');
        } catch (e) {
          availability = {};
        }

        return {
          ...session,
          // Set default values if properties don't exist in the parsed JSON
          requester_availability: {
            weekday: !!availability.weekday,
            weekend: !!availability.weekend,
            morning: !!availability.morning,
            afternoon: !!availability.afternoon,
            evening: !!availability.evening,
          },
          created_at: session.created_at,
          updated_at: session.updated_at,
          expires_at: session.expires_at,
          event_id: session.event_id || undefined,
          id: session.id,
          skill_id: session.skill_id,
          requester_id: session.requester_id,
          provider_id: session.provider_id,
          status: session.status,
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
