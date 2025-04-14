
import { Calendar, HelpCircle, Heart, AlertTriangle, Package, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddEventDialog from "./AddEventDialog";
import AddSupportRequestDialog from "./AddSupportRequestDialog";
import AddSafetyUpdateDialog from "./AddSafetyUpdateDialog";

/**
 * QuickActions component displays common actions for users to interact with the community.
 * 
 * This includes:
 * - Adding events
 * - Sharing or requesting items (goods)
 * - Sharing or requesting skills
 * - Adding safety updates
 * 
 * Now displayed as a 3-column grid at the top of the homepage
 */
const QuickActions = () => {
  // State for controlling various dialogs
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isSafetyUpdateOpen, setIsSafetyUpdateOpen] = useState(false);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const [requestView, setRequestView] = useState<string | undefined>();

  // All actions in a single array for a more flexible grid layout
  const allActions = [
    // Goods actions (orange)
    { 
      icon: Package, 
      label: "Share an item", 
      onClick: () => {
        setInitialRequestType("offer");
        setRequestView('goods');
        setIsAddRequestOpen(true);
      },
      className: "bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30"
    },
    { 
      icon: Package, 
      label: "Request an item", 
      onClick: () => {
        setInitialRequestType("need");
        setRequestView('goods');
        setIsAddRequestOpen(true);
      },
      className: "bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30"
    },
    
    // Skills actions (purple)
    { 
      icon: Wrench, 
      label: "Share a Skill", 
      onClick: () => {
        setInitialRequestType("offer");
        setRequestView('skills');
        setIsAddRequestOpen(true);
      },
      className: "bg-[#9b87f5]/10 hover:bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30"
    },
    { 
      icon: HelpCircle, 
      label: "Request a Skill", 
      onClick: () => {
        setInitialRequestType("need");
        setRequestView('skills');
        setIsAddRequestOpen(true);
      },
      className: "bg-[#9b87f5]/10 hover:bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30"
    },
    
    // Other actions (blue and red)
    { 
      icon: Calendar, 
      label: "Add Event", 
      onClick: () => setIsAddEventOpen(true),
      className: "bg-[#0EA5E9]/10 hover:bg-[#0EA5E9]/20 text-[#0EA5E9] border-[#0EA5E9]/30"
    },
    { 
      icon: AlertTriangle, 
      label: "Add Safety Update", 
      onClick: () => setIsSafetyUpdateOpen(true),
      className: "bg-[#EA384C]/10 hover:bg-[#EA384C]/20 text-[#EA384C] border-[#EA384C]/30"
    }
  ];

  return (
    <div className="w-full">
      {/* Brief welcome message */}
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mb-6">
        <p className="text-gray-700 text-sm">
          Welcome to your community hub. Here you can quickly access common actions
          to connect, share, and engage with your neighbors.
        </p>
      </div>

      {/* Fixed 3-column grid for all actions */}
      <div className="grid grid-cols-3 gap-4">
        {allActions.map(action => (
          <Button 
            key={action.label} 
            variant="outline" 
            className={`flex flex-col items-center justify-center h-24 py-2 border-2 ${action.className}`} 
            onClick={action.onClick}
          >
            <action.icon className="h-6 w-6 mb-2" />
            <span className="text-sm text-center">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Dialog components */}
      <AddEventDialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen} onAddEvent={() => {}} />
      <AddSupportRequestDialog 
        open={isAddRequestOpen} 
        onOpenChange={setIsAddRequestOpen} 
        initialRequestType={initialRequestType} 
        view={requestView} 
      />
      <AddSafetyUpdateDialog open={isSafetyUpdateOpen} onOpenChange={setIsSafetyUpdateOpen} />
    </div>
  );
};

export default QuickActions;
