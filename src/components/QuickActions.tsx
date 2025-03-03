
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
 */
const QuickActions = () => {
  // State for controlling various dialogs
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isSafetyUpdateOpen, setIsSafetyUpdateOpen] = useState(false);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const [requestView, setRequestView] = useState<string | undefined>();

  // Actions available to the user
  // Reorganized to group actions with the same color theme together
  const actions = [
    // Calendar - blue theme
    { 
      icon: Calendar, 
      label: "Add Event", 
      onClick: () => setIsAddEventOpen(true),
      className: "bg-[#0EA5E9]/10 hover:bg-[#0EA5E9]/20 text-[#0EA5E9] border-[#0EA5E9]/30"
    },
    // Safety - red theme
    { 
      icon: AlertTriangle, 
      label: "Add Safety Update", 
      onClick: () => setIsSafetyUpdateOpen(true),
      className: "bg-[#EA384C]/10 hover:bg-[#EA384C]/20 text-[#EA384C] border-[#EA384C]/30"
    },
    // Goods - orange theme (Share item)
    { 
      icon: Package, 
      label: "Share an item", 
      onClick: () => {
        setInitialRequestType("offer");
        setRequestView('goods');  // Use the goods-specific form
        setIsAddRequestOpen(true);
      },
      className: "bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30"
    },
    // Goods - orange theme (Request item)
    { 
      icon: Package, 
      label: "Request an item", 
      onClick: () => {
        setInitialRequestType("need");
        setRequestView('goods');  // Use the goods-specific form
        setIsAddRequestOpen(true);
      },
      className: "bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30"
    },
    // Skills - purple theme (Share skill)
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
    // Skills - purple theme (Request skill)
    { 
      icon: HelpCircle, 
      label: "Request a Skill", 
      onClick: () => {
        setInitialRequestType("need");
        setRequestView('skills');
        setIsAddRequestOpen(true);
      },
      className: "bg-[#9b87f5]/10 hover:bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30"
    }
  ];

  return (
    <div className="w-full">
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mb-6">
        <p className="text-gray-700 text-sm">
          Welcome to your community hub. Here you can quickly access common actions
          to connect, share, and engage with your neighbors.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map(action => (
          <Button 
            key={action.label} 
            variant="outline" 
            className={`flex flex-row items-center justify-start h-12 px-2 border-2 ${action.className}`} 
            onClick={action.onClick}
          >
            <action.icon className="h-5 w-5 mr-2" />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>
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
