
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SkillSession, TimeSlot } from "@/types/skillSessions";
import { useUser } from "@supabase/auth-helpers-react";

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
      const transformedSessions: SkillSession[] = sessions.map(session => ({
        ...session,
        // Parse the JSON requester_availability into our expected structure
        requester_availability: {
          weekday: session.requester_availability?.weekday ?? false,
          weekend: session.requester_availability?.weekend ?? false,
          morning: session.requester_availability?.morning ?? false,
          afternoon: session.requester_availability?.afternoon ?? false,
          evening: session.requester_availability?.evening ?? false,
        },
        // Ensure all required fields are present with proper types
        created_at: session.created_at,
        updated_at: session.updated_at,
        expires_at: session.expires_at,
        event_id: session.event_id || undefined,
        id: session.id,
        skill_id: session.skill_id,
        requester_id: session.requester_id,
        provider_id: session.provider_id,
        status: session.status as SkillSessionStatus,
      }));

      return {
        sessions: transformedSessions,
        timeSlots: timeSlotsBySession,
      };
    },
    enabled: !!user,
  });
};
