import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Example event data
const events = {
  1: [
    {
      id: 1,
      title: "Community Garden Workshop",
      host: "Sarah Chen",
      time: "10:00 AM",
      description: "Learn about sustainable gardening practices and help maintain our community garden. Bring your own gloves and we'll provide the rest of the tools!"
    }
  ],
  3: [
    {
      id: 2,
      title: "Neighborhood Watch Meeting",
      host: "Robert Martinez",
      time: "7:00 PM",
      description: "Monthly meeting to discuss neighborhood safety and upcoming initiatives."
    }
  ],
  5: [
    {
      id: 3,
      title: "Kids Art in Park",
      host: "Emily Wong",
      time: "3:30 PM",
      description: "Outdoor art session for children ages 5-12. All materials provided. Parents must be present."
    },
    {
      id: 4,
      title: "Evening Yoga Session",
      host: "David Kumar",
      time: "6:00 PM",
      description: "Beginner-friendly yoga session in the community center. Bring your own mat!"
    }
  ]
};

const EventCard = ({ event }: { event: typeof events[keyof typeof events][0] }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="bg-white rounded-sm p-2 mb-1 text-xs cursor-pointer hover:bg-gray-50 border-l-4 border-primary">
          <div className="font-medium truncate">{event.title}</div>
          <div className="flex items-center gap-1 text-gray-600">
            <User className="h-3 w-3" />
            <span className="truncate">{event.host}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-3 w-3" />
            <span>{event.time}</span>
          </div>
        </div>
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
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = Array.from({ length: 7 }, (_, i) => i + 1);

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
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">Today</Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-6">
        {days.map((day, i) => (
          <div key={day} className="text-center">
            <div className="text-sm font-medium text-muted-foreground mb-2">{day}</div>
            <div className="text-sm font-semibold mb-3">{dates[i]}</div>
            <div className="min-h-[200px] bg-gray-50/50 p-3 rounded-lg border border-gray-100 shadow-sm">
              {events[dates[i]]?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityCalendar;