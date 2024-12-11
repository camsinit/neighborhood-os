import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, User, MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useState } from "react";
import { addWeeks, subWeeks, startOfWeek, addDays, format } from "date-fns";

// Example event data with added color property
const events = {
  11: [
    {
      id: 1,
      title: "Community Garden Workshop",
      host: "Sarah Chen",
      time: "10:00 AM",
      location: "Community Garden, 123 Main St",
      description: "Learn about sustainable gardening practices and help maintain our community garden. Bring your own gloves and we'll provide the rest of the tools!",
      color: "bg-yellow-100 border-yellow-300"
    }
  ],
  13: [
    {
      id: 2,
      title: "Neighborhood Watch Meeting",
      host: "Robert Martinez",
      time: "7:00 PM",
      location: "Community Center Room 2B",
      description: "Monthly meeting to discuss neighborhood safety and upcoming initiatives.",
      color: "bg-purple-100 border-purple-300"
    }
  ],
  15: [
    {
      id: 3,
      title: "Kids Art in Park",
      host: "Emily Wong",
      time: "3:30 PM",
      location: "Central Park Pavilion",
      description: "Outdoor art session for children ages 5-12. All materials provided. Parents must be present.",
      color: "bg-blue-100 border-blue-300"
    },
    {
      id: 4,
      title: "Evening Yoga Session",
      host: "David Kumar",
      time: "6:00 PM",
      location: "Wellness Center Studio 3",
      description: "Beginner-friendly yoga session in the community center. Bring your own mat!",
      color: "bg-green-100 border-green-300"
    }
  ]
};

const EventCard = ({ event }: { event: typeof events[keyof typeof events][0] }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className={`rounded-md p-1.5 mb-1 text-xs cursor-pointer hover:bg-opacity-80 border-l-4 ${event.color}`}>
              <div className="font-medium truncate">{event.title}</div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{event.time}</span>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">{event.title}</h4>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span>{event.host}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{event.location}</span>
              </div>
              <p className="text-sm text-gray-600">{event.description}</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{event.title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">{event.host}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">{event.location}</span>
          </div>
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">About this event</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const CommunityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const weekStart = startOfWeek(currentDate);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Community Calendar</h2>
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="active">Week</Button>
            <Button variant="outline" size="sm">Month</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>Today</Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {dates.map((date, i) => (
          <div key={i} className="bg-white p-4">
            <div className="text-sm text-gray-500 mb-1">{days[i]}</div>
            <div className="text-lg font-medium mb-3">{format(date, 'd')}</div>
            <div className="space-y-1">
              {events[parseInt(format(date, 'd'))]?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
              {events[parseInt(format(date, 'd'))]?.length > 3 && (
                <div className="text-xs text-gray-500 mt-2">
                  {events[parseInt(format(date, 'd'))]!.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityCalendar;