import { supabase } from "@/integrations/supabase/client";
import { addDays, addHours, addMonths } from "date-fns";

export const seedDashboard = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Safety Updates
  const safetyUpdates = [
    {
      type: "Updates",
      title: "New Street Lights Installation",
      description: "The city will be installing LED street lights on Oak Avenue next week to improve nighttime visibility.",
      author_id: user.id
    },
    {
      type: "Maintenance",
      title: "Community Garden Water System",
      description: "The irrigation system in the community garden will be upgraded this weekend. Please hand-water your plants on Saturday.",
      author_id: user.id
    },
    {
      type: "Alerts",
      title: "Temporary Road Closure",
      description: "Maple Street will be closed for repaving between 9 AM and 4 PM tomorrow. Please use alternate routes.",
      author_id: user.id
    }
  ];

  // Support Requests
  const supportRequests = [
    {
      type: "goods",
      request_type: "offer",
      title: "Free Moving Boxes",
      description: "Just finished moving and have about 20 sturdy boxes of various sizes. Available for pickup this weekend.",
      user_id: user.id,
      valid_until: addDays(new Date(), 7).toISOString(),
      status: "active"
    },
    {
      type: "skills",
      request_type: "need",
      title: "Help with Basic Phone Setup",
      description: "Looking for someone to help my elderly neighbor set up her new smartphone. Should take about an hour.",
      user_id: user.id,
      valid_until: addDays(new Date(), 14).toISOString(),
      status: "active"
    },
    {
      type: "transportation",
      request_type: "offer",
      title: "Regular Rides to Grocery Store",
      description: "I go to Trader Joe's every Sunday morning. Happy to take neighbors who need a ride.",
      user_id: user.id,
      valid_until: addDays(new Date(), 30).toISOString(),
      status: "active"
    },
    {
      type: "resources",
      request_type: "need",
      title: "Seeking Spanish Language Exchange",
      description: "Looking for a conversation partner to practice Spanish with. Happy to help with English in return!",
      user_id: user.id,
      valid_until: addMonths(new Date(), 2).toISOString(),
      status: "active"
    },
    {
      type: "goods",
      request_type: "need",
      title: "Looking for Garden Tools",
      description: "Starting a small vegetable garden. Would appreciate borrowing or buying used gardening tools.",
      user_id: user.id,
      valid_until: addDays(new Date(), 21).toISOString(),
      status: "active"
    }
  ];

  // Events
  const events = [
    {
      title: "Monthly Neighborhood Cleanup",
      description: "Join us for our monthly neighborhood cleanup! Bring gloves if you have them. Tools and bags provided.",
      time: addDays(new Date(), 3).toISOString(),
      location: "Meet at Central Park entrance",
      host_id: user.id
    },
    {
      title: "Community Garden Workshop",
      description: "Learn about seasonal planting and composting. Perfect for beginners!",
      time: addDays(addHours(new Date(), 4), 5).toISOString(),
      location: "Community Garden on Pine Street",
      host_id: user.id
    },
    {
      title: "Block Party Planning Meeting",
      description: "Help us plan the upcoming summer block party. All neighbors welcome!",
      time: addDays(addHours(new Date(), 2), 1).toISOString(),
      location: "Community Center",
      host_id: user.id
    },
    {
      title: "Local Artists Exhibition",
      description: "Showcase of local artists' work with light refreshments. Come support our creative neighbors!",
      time: addDays(new Date(), 10).toISOString(),
      location: "Community Center Gallery",
      host_id: user.id
    },
    {
      title: "Senior Citizens' Social",
      description: "Afternoon tea and board games for our senior residents. All ages welcome to join!",
      time: addDays(new Date(), 7).toISOString(),
      location: "Library Meeting Room",
      host_id: user.id
    }
  ];

  try {
    // Insert safety updates
    await supabase.from('safety_updates').insert(safetyUpdates);
    
    // Insert support requests
    for (const request of supportRequests) {
      await supabase.from('support_requests').insert(request);
    }
    
    // Insert events
    for (const event of events) {
      await supabase.from('events').insert(event);
    }

    console.log('Dashboard populated successfully!');
  } catch (error) {
    console.error('Error populating dashboard:', error);
    throw error;
  }
};