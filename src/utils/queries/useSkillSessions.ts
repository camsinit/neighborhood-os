
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

      return {
        sessions: sessions as SkillSession[],
        timeSlots: timeSlotsBySession,
      };
    },
    enabled: !!user,
  });
};
