import { Calendar, HelpCircle, Heart, AlertTriangle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddEventDialog from "./AddEventDialog";
import AddSupportRequestDialog from "./AddSupportRequestDialog";
import AddSafetyUpdateDialog from "./AddSafetyUpdateDialog";
import { seedDashboardData } from "@/utils/seedData";

const QuickActions = () => {
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isSafetyUpdateOpen, setIsSafetyUpdateOpen] = useState(false);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);

  const actions = [
    { 
      icon: Calendar, 
      label: "Add Event", 
      onClick: () => setIsAddEventOpen(true),
      className: "bg-[#D3E4FD] hover:bg-[#D3E4FD]/80 text-blue-700 border-blue-300"
    },
    { 
      icon: HelpCircle, 
      label: "Ask for Help", 
      onClick: () => {
        setInitialRequestType("need");
        setIsAddRequestOpen(true);
      },
      className: "bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300"
    },
    { 
      icon: Heart, 
      label: "Share an Offer", 
      onClick: () => {
        setInitialRequestType("offer");
        setIsAddRequestOpen(true);
      },
      className: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-300"
    },
    { 
      icon: AlertTriangle, 
      label: "Safety Update", 
      onClick: () => setIsSafetyUpdateOpen(true),
      className: "bg-[#FDE1D3] hover:bg-[#FDE1D3]/80 text-red-700 border-red-300"
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        <Button
          variant="outline"
          onClick={seedDashboardData}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
        >
          <Database className="h-4 w-4" />
          Populate Dashboard
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className={`flex flex-row items-center justify-start h-12 px-4 border-2 ${action.className}`}
            onClick={action.onClick}
          >
            <action.icon className="h-5 w-5 mr-3" />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>
      <AddEventDialog 
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onAddEvent={() => {}}
      />
      <AddSupportRequestDialog 
        open={isAddRequestOpen}
        onOpenChange={setIsAddRequestOpen}
        initialRequestType={initialRequestType}
      />
      <AddSafetyUpdateDialog
        open={isSafetyUpdateOpen}
        onOpenChange={setIsSafetyUpdateOpen}
      />
    </div>
  );
};

export default QuickActions;