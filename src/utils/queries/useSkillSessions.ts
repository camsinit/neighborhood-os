
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SkillSession, TimeSlot, SkillSessionStatus } from "@/types/skillSessions";
import { useUser } from "@supabase/auth-helpers-react";
import { Json } from "@/integrations/supabase/types";

// Define interface for availability data
interface AvailabilityData {
  weekday?: boolean;
  weekend?: boolean;
  morning?: boolean;
  afternoon?: boolean;
  evening?: boolean;
}

// Define an interface for the raw data from Supabase
interface RawSession {
  id: string;
  skill_id: string;
  requester_id: string;
  provider_id: string;
  requester_availability: Json;
  status: SkillSessionStatus;
  created_at: string;
  updated_at: string;
  expires_at: string;
  event_id?: string;
  skill?: {
    title: string;
    description: string | null;
    request_type: string;
    skill_category: string;
  } | null;
  requester?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  provider?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
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
      const transformedSessions: SkillSession[] = sessions.map((rawSession) => {
        // Parse the requester_availability into our expected format
        const rawAvailability = rawSession.requester_availability as AvailabilityData;
        
        // Create properly typed availability object
        const availability = {
          weekday: Boolean(rawAvailability?.weekday),
          weekend: Boolean(rawAvailability?.weekend),
          morning: Boolean(rawAvailability?.morning),
          afternoon: Boolean(rawAvailability?.afternoon),
          evening: Boolean(rawAvailability?.evening),
        };

        return {
          ...rawSession,
          requester_availability: availability,
          created_at: rawSession.created_at,
          updated_at: rawSession.updated_at,
          expires_at: rawSession.expires_at,
          event_id: rawSession.event_id || undefined,
          id: rawSession.id,
          skill_id: rawSession.skill_id,
          requester_id: rawSession.requester_id,
          provider_id: rawSession.provider_id,
          status: rawSession.status,
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
