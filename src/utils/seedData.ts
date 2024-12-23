import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const seedDashboardData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error("You must be logged in to seed data");
    return;
  }

  // Seed safety updates
  const safetyUpdates = [
    {
      type: "Updates",
      title: "New Street Lights Installation Complete",
      description: "All planned LED street lights have been installed along Oak Street and Maple Avenue. This improvement will enhance visibility and safety in our neighborhood.",
      author_id: user.id,
    },
    {
      type: "Alerts",
      title: "Temporary Road Closure",
      description: "Pine Street will be closed between 5th and 6th Avenue this weekend for scheduled maintenance. Please use alternate routes.",
      author_id: user.id,
    },
    {
      type: "Maintenance",
      title: "Community Garden Water System Upgrade",
      description: "The irrigation system in the community garden will be upgraded next week. Expect brief water interruptions during installation.",
      author_id: user.id,
    }
  ];

  // Seed support requests
  const supportRequests = [
    {
      type: "Goods",
      request_type: "offer",
      title: "Free Moving Boxes",
      description: "Just finished moving and have about 20 sturdy moving boxes to give away. All sizes available. Located near the community center.",
      user_id: user.id,
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    },
    {
      type: "Services",
      request_type: "need",
      title: "Looking for Math Tutor",
      description: "Seeking a high school math tutor for my daughter. Algebra II level, twice a week. Can meet at the library.",
      user_id: user.id,
      valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    },
    {
      type: "Skills",
      request_type: "offer",
      title: "Basic Computer Skills Workshop",
      description: "Offering free computer basics workshop for seniors. Can cover email, internet safety, and basic software use. Weekend availability.",
      user_id: user.id,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month from now
    }
  ];

  // Seed events
  const events = [
    {
      title: "Neighborhood Block Party",
      description: "Annual summer block party! Bring a dish to share, games, and chairs. Live music from local bands. All neighbors welcome!",
      time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      location: "Main Street (between 4th and 5th Ave)",
      host_id: user.id,
    },
    {
      title: "Community Garden Workshop",
      description: "Learn about summer vegetable planting and sustainable gardening practices. Tools and seedlings provided.",
      time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      location: "Community Garden",
      host_id: user.id,
    },
    {
      title: "Neighborhood Watch Meeting",
      description: "Monthly safety meeting and updates from local law enforcement. Special presentation on home security systems.",
      time: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      location: "Community Center - Room 101",
      host_id: user.id,
    }
  ];

  try {
    // Insert safety updates
    const { error: safetyError } = await supabase
      .from('safety_updates')
      .insert(safetyUpdates);
    
    if (safetyError) throw safetyError;

    // Insert support requests
    const { error: supportError } = await supabase
      .from('support_requests')
      .insert(supportRequests);
    
    if (supportError) throw supportError;

    // Insert events
    const { error: eventsError } = await supabase
      .from('events')
      .insert(events);
    
    if (eventsError) throw eventsError;

    toast.success("Dashboard populated with sample content!");
  } catch (error) {
    console.error('Error seeding data:', error);
    toast.error("Failed to populate dashboard. Please try again.");
  }
};