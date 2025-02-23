import { useState } from "react";
import CommunityCalendar from "@/components/CommunityCalendar";

const CalendarPage = () => {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#F2FCE2] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h2 className="text-2xl font-bold text-gray-900">Community Calendar</h2>
          
          <div className="bg-white rounded-lg p-4 mt-2 mb-6 shadow-md">
            <p className="text-gray-700 text-sm">
              Stay connected with your community through local events. View upcoming gatherings, 
              create new events, and join your neighbors in building stronger connections.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <CommunityCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
