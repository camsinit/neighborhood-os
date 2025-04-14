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
      className: "text-[#F97316] border-[#F97316]"
    },
    { 
      icon: Package, 
      label: "Request an item", 
      onClick: () => {
        setInitialRequestType("need");
        setRequestView('goods');
        setIsAddRequestOpen(true);
      },
      className: "text-[#F97316] border-[#F97316]"
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
      className: "text-[#9b87f5] border-[#9b87f5]"
    },
    { 
      icon: HelpCircle, 
      label: "Request a Skill", 
      onClick: () => {
        setInitialRequestType("need");
        setRequestView('skills');
        setIsAddRequestOpen(true);
      },
      className: "text-[#9b87f5] border-[#9b87f5]"
    },
    
    // Other actions (blue and red)
    { 
      icon: Calendar, 
      label: "Add Event", 
      onClick: () => setIsAddEventOpen(true),
      className: "text-[#0EA5E9] border-[#0EA5E9]"
    },
    { 
      icon: AlertTriangle, 
      label: "Add Safety Update", 
      onClick: () => setIsSafetyUpdateOpen(true),
      className: "text-[#EA384C] border-[#EA384C]"
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

      {/* Fixed 3-column grid for all actions with smaller buttons */}
      <div className="grid grid-cols-3 gap-4">
        {allActions.map(action => (
          <Button 
            key={action.label} 
            variant="outline" 
            className={`flex items-center justify-center h-12 py-1 border-2 bg-transparent hover:bg-transparent ${action.className}`} 
            onClick={action.onClick}
          >
            <div className="flex items-center">
              <action.icon className="h-4 w-4 mr-2" />
              <span className="text-xs">{action.label}</span>
            </div>
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
