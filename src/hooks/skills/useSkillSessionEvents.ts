
/**
 * Hook for managing skill session events integration with calendar
 * This hook provides functions for creating, updating, and tracking skill session events
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SkillSessionEventData, createSkillSessionEvent } from "@/utils/skillSessionCalendar";
import { toast } from "sonner";

/**
 * Custom hook for managing skill session events
 * @returns Functions and state for managing skill session calendar events
 */
export const useSkillSessionEvents = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Schedule a skill session by creating a calendar event
  const scheduleSkillSession = async (eventData: SkillSessionEventData) => {
    setIsLoading(true);
    try {
      const eventId = await createSkillSessionEvent(eventData);
      
      if (!eventId) {
        throw new Error("Failed to create event");
      }
      
      // Success notification
      toast.success("Session scheduled!", {
        description: "The skill session has been added to the calendar."
      });
      
      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["skill-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      return eventId;
    } catch (error) {
      console.error("Error in scheduleSkillSession:", error);
      toast.error("Scheduling failed", {
        description: "There was a problem creating the session event."
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get upcoming skill session events
  const { data: upcomingSessionEvents } = useQuery({
    queryKey: ["skill-session-events"],
    queryFn: async () => {
      // First get skill sessions with event_id
      const { data: sessions, error: sessionsError } = await supabase
        .from("skill_sessions")
        .select(`
          id,
          skill_id,
          requester_id,
          provider_id,
          event_id,
          status,
          skill:skill_id (title)
        `)
        .not("event_id", "is", null)
        .eq("status", "confirmed");

      if (sessionsError) throw sessionsError;

      if (!sessions?.length) return [];

      // Get event details for those sessions
      const eventIds = sessions.map(s => s.event_id);
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds);

      if (eventsError) throw eventsError;

      // Combine the data
      return sessions.map(session => {
        const event = events?.find(e => e.id === session.event_id);
        return {
          sessionId: session.id,
          skillId: session.skill_id,
          skillTitle: session.skill?.title || "Unnamed skill",
          eventId: session.event_id,
          requesterId: session.requester_id,
          providerId: session.provider_id,
          eventDetails: event || null
        };
      });
    }
  });

  return {
    scheduleSkillSession,
    upcomingSessionEvents,
    isLoading
  };
};
