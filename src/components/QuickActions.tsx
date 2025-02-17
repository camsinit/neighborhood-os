
import { Calendar, HelpCircle, Heart, AlertTriangle, Package, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddEventDialog from "./AddEventDialog";
import AddSupportRequestDialog from "./AddSupportRequestDialog";
import AddSafetyUpdateDialog from "./AddSafetyUpdateDialog";

const QuickActions = () => {
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isSafetyUpdateOpen, setIsSafetyUpdateOpen] = useState(false);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const [requestView, setRequestView] = useState<string | undefined>();

  const actions = [
    { 
      icon: Calendar, 
      label: "Add Event", 
      onClick: () => setIsAddEventOpen(true),
      className: "bg-[#D3E4FD] hover:bg-[#D3E4FD]/80 text-blue-700 border-blue-300"
    },
    { 
      icon: Package, 
      label: "Share an item", 
      onClick: () => {
        setInitialRequestType("offer");
        setRequestView(undefined);
        setIsAddRequestOpen(true);
      },
      className: "bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300"
    },
    { 
      icon: Package, 
      label: "Request an item", 
      onClick: () => {
        setInitialRequestType("need");
        setRequestView(undefined);
        setIsAddRequestOpen(true);
      },
      className: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-300"
    },
    { 
      icon: Wrench, 
      label: "Share a Skill", 
      onClick: () => {
        setInitialRequestType("offer");
        setRequestView('skills');
        setIsAddRequestOpen(true);
      },
      className: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-indigo-300"
    },
    { 
      icon: HelpCircle, 
      label: "Request a Skill", 
      onClick: () => {
        setInitialRequestType("need");
        setRequestView('skills');
        setIsAddRequestOpen(true);
      },
      className: "bg-[#E8F5FF] hover:bg-[#E8F5FF]/80 text-sky-700 border-sky-300"
    },
    { 
      icon: AlertTriangle, 
      label: "Add Safety Update", // Changed this text from "Post a Safety Update"
      onClick: () => setIsSafetyUpdateOpen(true),
      className: "bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-300"
    },
  ];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mb-6">
        <p className="text-gray-700 text-sm">
          Welcome to your community hub. Here you can quickly access common actions
          to connect, share, and engage with your neighbors.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
        view={requestView}
      />
      <AddSafetyUpdateDialog
        open={isSafetyUpdateOpen}
        onOpenChange={setIsSafetyUpdateOpen}
      />
    </div>
  );
};

export default QuickActions;
