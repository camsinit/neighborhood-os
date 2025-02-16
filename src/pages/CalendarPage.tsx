
import CommunityCalendar from "@/components/CommunityCalendar";

const CalendarPage = () => {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <CommunityCalendar />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
