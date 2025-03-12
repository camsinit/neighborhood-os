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
    // Add safety updates
    const safetyUpdates = mockSafetyUpdates.map(update => ({
      ...update,
      author_id: userId,
      neighborhood_id: neighborhoodId
    }));
    await supabase.from('safety_updates').insert(safetyUpdates);

    // Add events
    const events = mockEvents.map(event => ({
      ...event,
      host_id: userId,
      neighborhood_id: neighborhoodId
    }));
    await supabase.from('events').insert(events);

    console.log('Dashboard seeded successfully');
  } catch (error) {
    console.error('Error seeding dashboard:', error);
    throw error;
  }
};
