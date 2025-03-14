
import { supabase } from "@/integrations/supabase/client";

interface MockSafetyUpdate {
  type: string;
  title: string;
  description: string;
  author_id: string;
}

interface MockEvent {
  title: string;
  description: string;
  time: string;
  location: string;
  host_id: string;
}

const mockSafetyUpdates: MockSafetyUpdate[] = [
  {
    type: 'alerts',
    title: 'Be aware of suspicious activity',
    description: 'There have been reports of suspicious individuals in the neighborhood. Please be vigilant and report any concerns to the authorities.',
    author_id: '',
  },
  {
    type: 'maintenance',
    title: 'Street cleaning scheduled for next week',
    description: 'Please move your vehicles off the street on Tuesday for street cleaning.',
    author_id: '',
  },
];

const mockEvents: MockEvent[] = [
  {
    title: 'Neighborhood BBQ',
    description: 'Join us for a neighborhood BBQ at the park. Bring a dish to share!',
    time: '2024-07-20T14:00:00',
    location: 'Central Park',
    host_id: '',
  },
  {
    title: 'Community Meeting',
    description: 'Discuss important neighborhood issues and upcoming projects.',
    time: '2024-08-05T19:00:00',
    location: 'Community Center',
    host_id: '',
  },
];

export const seedDashboardData = async (userId: string, neighborhoodId: string) => {
  try {
    console.log("[seedDashboardData] Starting dashboard seeding:", {
      userId,
      neighborhoodId,
      timestamp: new Date().toISOString()
    });

    // Add safety updates
    const safetyUpdates = mockSafetyUpdates.map(update => ({
      ...update,
      author_id: userId,
      neighborhood_id: neighborhoodId
    }));

    console.log("[seedDashboardData] Inserting safety updates:", {
      updateCount: safetyUpdates.length,
      samples: safetyUpdates.map(u => ({ title: u.title, type: u.type })),
    });

    const { error: safetyError, data: safetyData } = await supabase
      .from('safety_updates')
      .insert(safetyUpdates)
      .select();

    if (safetyError) {
      console.error("[seedDashboardData] Error inserting safety updates:", {
        error: {
          message: safetyError.message,
          details: safetyError.details,
          hint: safetyError.hint,
          code: safetyError.code
        },
        userId,
        neighborhoodId
      });
    } else {
      console.log("[seedDashboardData] Safety updates inserted successfully:", {
        insertedCount: safetyData?.length || 0,
        ids: safetyData?.map(item => item.id) || []
      });
    }

    // Add events
    const events = mockEvents.map(event => ({
      ...event,
      host_id: userId,
      neighborhood_id: neighborhoodId
    }));

    console.log("[seedDashboardData] Inserting events:", {
      eventCount: events.length,
      samples: events.map(e => ({ title: e.title, location: e.location })),
    });

    const { error: eventsError, data: eventsData } = await supabase
      .from('events')
      .insert(events)
      .select();

    if (eventsError) {
      console.error("[seedDashboardData] Error inserting events:", {
        error: {
          message: eventsError.message,
          details: eventsError.details,
          hint: eventsError.hint,
          code: eventsError.code
        },
        userId,
        neighborhoodId
      });
    } else {
      console.log("[seedDashboardData] Events inserted successfully:", {
        insertedCount: eventsData?.length || 0,
        ids: eventsData?.map(item => item.id) || []
      });
    }

    console.log('[seedDashboardData] Dashboard seeding completed successfully');
  } catch (error) {
    console.error('[seedDashboardData] Error seeding dashboard:', error);
    throw error;
  }
};
