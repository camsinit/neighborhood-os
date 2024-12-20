import { CalendarEvents } from "@/types/calendar";

export const monthEvents: CalendarEvents = {
  // Week 1
  31: [
    {
      id: 1,
      title: "Neighborhood Clean-up Day",
      host: "Sarah Chen",
      time: "09:00 - 12:00",
      location: "Community Park",
      description: "Join us for our monthly neighborhood clean-up initiative. Bring gloves!",
      color: "bg-green-100 border-green-300",
      attendees: 15
    }
  ],
  5: [
    {
      id: 2,
      title: "Community Garden Workshop",
      host: "Emily Wong",
      time: "10:30 - 12:00",
      location: "Community Garden",
      description: "Learn about winter vegetable planting and sustainable gardening practices",
      color: "bg-purple-100 border-purple-300",
      attendees: 8
    }
  ],
  // Week 2
  9: [
    {
      id: 3,
      title: "Local Artists Exhibition",
      host: "Alex Johnson",
      time: "14:00 - 17:00",
      location: "Community Center",
      description: "Showcase of local artists' work with light refreshments",
      color: "bg-orange-100 border-orange-300",
      attendees: 25
    }
  ],
  11: [
    {
      id: 4,
      title: "Neighborhood Watch Meeting",
      host: "Michael Brown",
      time: "18:30 - 19:30",
      location: "Library Meeting Room",
      description: "Monthly safety meeting and updates from local law enforcement",
      color: "bg-blue-100 border-blue-300",
      attendees: 12
    }
  ],
  13: [
    {
      id: 5,
      title: "Senior Citizens' Social",
      host: "Lisa Park",
      time: "15:00 - 17:00",
      location: "Community Center",
      description: "Afternoon tea and board games for our senior residents",
      color: "bg-pink-100 border-pink-300",
      attendees: 20
    }
  ],
  // Week 3
  14: [
    {
      id: 6,
      title: "Youth Sports Day",
      host: "David Kumar",
      time: "10:00 - 14:00",
      location: "Sports Field",
      description: "Fun sports activities for neighborhood youth aged 8-15",
      color: "bg-yellow-100 border-yellow-300",
      attendees: 30
    }
  ],
  18: [
    {
      id: 7,
      title: "Book Club Meeting",
      host: "Sophie Chen",
      time: "19:00 - 20:30",
      location: "Local Library",
      description: "Discussion of this month's book selection",
      color: "bg-purple-100 border-purple-300",
      attendees: 15
    }
  ],
  // Week 4
  19: [
    {
      id: 10,
      title: "Personal Emergency Preparedness Training",
      host: "Michael Rodriguez",
      time: "14:00 - 16:30",
      location: "Community Center - Main Hall",
      description: "Learn essential emergency preparedness skills including first aid basics, emergency kit assembly, evacuation planning, and communication during disasters. Bring a notebook and wear comfortable clothing.",
      color: "bg-blue-100 border-blue-300",
      attendees: 0
    }
  ],
  23: [
    {
      id: 8,
      title: "Holiday Cookie Exchange",
      host: "Ryan Wilson",
      time: "16:00 - 18:00",
      location: "Community Kitchen",
      description: "Bring your favorite holiday cookies to share and exchange recipes",
      color: "bg-red-100 border-red-300",
      attendees: 18
    }
  ],
  27: [
    {
      id: 9,
      title: "Winter Festival Planning",
      host: "Emma Thompson",
      time: "18:00 - 19:30",
      location: "Community Hall",
      description: "Planning meeting for the upcoming neighborhood winter festival",
      color: "bg-blue-100 border-blue-300",
      attendees: 10
    }
  ]
};
