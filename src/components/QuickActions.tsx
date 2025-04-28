
import { Calendar, HelpCircle, Heart, AlertTriangle, Package, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddEventDialog from "./AddEventDialog";
import AddSupportRequestDialog from "./AddSupportRequestDialog";
import AddSafetyUpdateDialog from "./AddSafetyUpdateDialog";
import ModuleButton from "./ui/module-button";
import { moduleThemeColors } from "@/theme/moduleTheme";

/**
 * QuickActions component displays common actions for users to interact with the community.
 * 
 * This includes:
 * - Adding events
 * - Sharing or requesting items (goods)
 * - Sharing or requesting skills
 * - Adding safety updates
 * 
 * Now organized into columns by module type for better usability
 */
const QuickActions = () => {
  // State for controlling various dialogs
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [isSafetyUpdateOpen, setIsSafetyUpdateOpen] = useState(false);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  const [requestView, setRequestView] = useState<string | undefined>();

  // Goods/Items actions (orange theme)
  const goodsActions = [
    { 
      icon: Package, 
      label: "Share an item", 
      onClick: () => {
        setInitialRequestType("offer");
        setRequestView('goods');
        setIsAddRequestOpen(true);
      },
      moduleTheme: 'goods' as const
    },
    { 
      icon: Package, 
      label: "Request an item", 
      onClick: () => {
        setInitialRequestType("need");
        setRequestView('goods');
        setIsAddRequestOpen(true);
      },
      moduleTheme: 'goods' as const
    }
  ];
  
  // Skills actions (green theme)
  const skillsActions = [
    { 
      icon: Wrench, 
      label: "Share a skill", 
      onClick: () => {
        setInitialRequestType("offer");
        setRequestView('skills');
        setIsAddRequestOpen(true);
      },
      moduleTheme: 'skills' as const
    },
    { 
      icon: HelpCircle, 
      label: "Request a skill", 
      onClick: () => {
        setInitialRequestType("need");
        setRequestView('skills');
        setIsAddRequestOpen(true);
      },
      moduleTheme: 'skills' as const
    }
  ];
  
  // Events & Safety actions (blue and red themes)
  const otherActions = [
    { 
      icon: Calendar, 
      label: "Add Event", 
      onClick: () => setIsAddEventOpen(true),
      moduleTheme: 'calendar' as const
    },
    { 
      icon: AlertTriangle, 
      label: "Add Safety Update", 
      onClick: () => setIsSafetyUpdateOpen(true),
      moduleTheme: 'safety' as const
    }
  ];

  /**
   * ActionColumn component for displaying a column of actions with a header
   * This helps organize actions by their module type
   */
  const ActionColumn = ({ 
    title, 
    actions,
    moduleType
  }: { 
    title: string, 
    actions: Array<{
      icon: any; 
      label: string; 
      onClick: () => void;
      moduleTheme: "goods" | "skills" | "calendar" | "safety";
    }>,
    moduleType: "goods" | "skills" | "calendar" | "safety"
  }) => (
    <div className="flex flex-col gap-2">
      {/* Column heading with colored accent */}
      <h3 
        className="text-sm font-semibold mb-2 pb-1 border-b-2" 
        style={{ borderColor: moduleThemeColors[moduleType].primary }}
      >
        {title}
      </h3>
      
      {/* Actions in this column with enhanced styling but less saturated colors */}
      <div className="space-y-3">
        {actions.map(action => (
          <ModuleButton
            key={action.label}
            moduleTheme={action.moduleTheme}
            variant="pastel"  // Keeping the "pastel" variant for buttons
            className="w-full justify-start shadow-sm hover:shadow-md transition-all duration-200 transform hover:translate-y-[-2px]"
            onClick={action.onClick}
          >
            <action.icon className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">{action.label}</span>
          </ModuleButton>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Brief welcome message */}
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mb-6">
        <p className="text-gray-700 text-sm">
          Welcome to your community hub. Here you can quickly access common actions
          to connect, share, and engage with your neighbors.
        </p>
      </div>

      {/* Three-column grid for organized actions */}
      <div className="grid grid-cols-3 gap-6">
        <ActionColumn title="Items" actions={goodsActions} moduleType="goods" />
        <ActionColumn title="Skills" actions={skillsActions} moduleType="skills" />
        <ActionColumn title="Events & Safety" actions={otherActions} moduleType="calendar" />
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
