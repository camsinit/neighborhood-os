import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CommunityCalendar = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = Array.from({ length: 7 }, (_, i) => i + 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Community Calendar</h2>
        <div className="flex items-center gap-4">
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
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, i) => (
          <div key={day} className="text-center">
            <div className="text-sm text-muted-foreground mb-2">{day}</div>
            <div className="text-sm">{dates[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityCalendar;