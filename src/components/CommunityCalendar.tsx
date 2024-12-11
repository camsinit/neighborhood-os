import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, User, MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useState } from "react";
import { 
  addWeeks, 
  subWeeks, 
  startOfWeek, 
  endOfWeek,
  addDays, 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth 
} from "date-fns";

// Example event data with added color property
const monthEvents = {
  // Week 1
  31: [
    {
      id: 1,
      title: "Update Design System",
      host: "Sarah Chen",
      time: "10:30 - 12:00",
      location: "Design Lab",
      description: "Monthly design system update and review session",
      color: "bg-purple-100 border-purple-300"
    }
  ],
  5: [
    {
      id: 2,
      title: "Update Design System",
      host: "Emily Wong",
      time: "10:30 - 12:00",
      location: "Virtual Meeting Room",
      description: "Review and update design system components",
      color: "bg-pink-100 border-pink-300"
    }
  ],
  // Week 2
  9: [
    {
      id: 3,
      title: "Wireframe Update",
      host: "Alex Johnson",
      time: "10:30 - 12:00",
      location: "Design Studio",
      description: "Review and update website wireframes",
      color: "bg-orange-100 border-orange-300"
    }
  ],
  11: [
    {
      id: 4,
      title: "Client Website",
      host: "Michael Brown",
      time: "10:30 - 12:00",
      location: "Meeting Room A",
      description: "Client website development review",
      color: "bg-green-100 border-green-300"
    }
  ],
  13: [
    {
      id: 5,
      title: "Update Design System",
      host: "Lisa Park",
      time: "10:30 - 12:00",
      location: "Design Lab",
      description: "Biweekly design system maintenance",
      color: "bg-purple-100 border-purple-300"
    }
  ],
  // Week 3
  14: [
    {
      id: 6,
      title: "Website Product Envato",
      host: "David Kumar",
      time: "10:30 - 12:00",
      location: "Virtual Room",
      description: "Envato marketplace product review",
      color: "bg-purple-100 border-purple-300"
    }
  ],
  18: [
    {
      id: 7,
      title: "Wireframe Update",
      host: "Sophie Chen",
      time: "10:30 - 12:00",
      location: "Design Studio",
      description: "Weekly wireframe review session",
      color: "bg-orange-100 border-orange-300"
    }
  ],
  // Week 4
  23: [
    {
      id: 8,
      title: "Website Product UI kit",
      host: "Ryan Wilson",
      time: "10:30 - 12:00",
      location: "Design Lab",
      description: "UI kit development and review",
      color: "bg-yellow-100 border-yellow-300"
    }
  ],
  27: [
    {
      id: 9,
      title: "Wireframe Update",
      host: "Emma Thompson",
      time: "10:30 - 12:00",
      location: "Meeting Room B",
      description: "Final wireframe review of the month",
      color: "bg-orange-100 border-orange-300"
    }
  ]
};

const EventCard = ({ event }: { event: typeof monthEvents[keyof typeof monthEvents][0] }) => {
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
  const [view, setView] = useState<'week' | 'month'>('week');
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const weekStart = startOfWeek(currentDate);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthDates = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {weekDates.map((date, i) => (
        <div key={i} className="bg-white p-4">
          <div className="text-sm text-gray-500 mb-1">{days[i]}</div>
          <div className="text-lg font-medium mb-3">{format(date, 'd')}</div>
          <div className="space-y-1">
            {monthEvents[parseInt(format(date, 'd'))]?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {days.map((day, i) => (
        <div key={i} className="bg-white p-2 text-sm text-gray-500 font-medium text-center">
          {day}
        </div>
      ))}
      {monthDates.map((date, i) => (
        <div 
          key={i} 
          className={`bg-white p-2 min-h-[120px] ${!isSameMonth(date, currentDate) ? 'opacity-50' : ''}`}
        >
          <div className="text-sm font-medium mb-2">{format(date, 'd')}</div>
          <div className="space-y-1">
            {monthEvents[parseInt(format(date, 'd'))]?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Community Calendar</h2>
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={view === 'week' ? 'bg-primary text-white hover:bg-primary' : ''}
              onClick={() => setView('week')}
            >
              Week
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={view === 'month' ? 'bg-primary text-white hover:bg-primary' : ''}
              onClick={() => setView('month')}
            >
              Month
            </Button>
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
      {view === 'week' ? renderWeekView() : renderMonthView()}
    </div>
  );
};

export default CommunityCalendar;
