
import { Calendar, HelpCircle, Heart, AlertTriangle, Package, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddEventDialog from "./AddEventDialog";
import AddSafetyUpdateDialogNew from "./safety/AddSafetyUpdateDialogNew";
import AddSkillPopover from "./skills/AddSkillPopover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import GoodsForm from "./goods/GoodsForm";
import ModuleButton from "./ui/module-button";
import { moduleThemeColors } from "@/theme/moduleTheme";

/**
 * QuickActions component displays common actions for users to interact with the community.
 * 
 * This includes:
 * - Adding events
 * - Sharing or requesting items (goods) - now using proper goods forms
 * - Sharing or requesting skills
 * - Adding safety updates
 * 
 * Now organized into columns by module type for better usability
 * Updated to use the same safety dialog as the Safety Page for consistency
 * Updated to use proper goods forms instead of generic support request forms
 */
const QuickActions = () => {
  const navigate = useNavigate();
  
  // State for controlling various dialogs and sheets
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isSafetyUpdateOpen, setIsSafetyUpdateOpen] = useState(false);
  const [isGoodsSheetOpen, setIsGoodsSheetOpen] = useState(false);
  const [isSkillPopoverOpen, setIsSkillPopoverOpen] = useState(false);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);

  // Goods/Items actions (orange theme) - now open proper goods sheet
  const goodsActions = [{
    icon: Package,
    label: "Share an item",
    onClick: () => {
      setInitialRequestType("offer");
      setIsGoodsSheetOpen(true);
    },
    moduleTheme: 'goods' as const
  }, {
    icon: Package,
    label: "Request an item",
    onClick: () => {
      setInitialRequestType("need");
      setIsGoodsSheetOpen(true);
    },
    moduleTheme: 'goods' as const
  }];

  // Skills actions (green theme) - now open proper skills popover
  const skillsActions = [{
    icon: Wrench,
    label: "Share a skill",
    onClick: () => {
      setIsSkillPopoverOpen(true);
    },
    moduleTheme: 'skills' as const
  }, {
    icon: HelpCircle,
    label: "Request a skill",
    onClick: () => {
      setIsSkillPopoverOpen(true);
    },
    moduleTheme: 'skills' as const
  }];

  // Events & Safety actions (blue and red themes)
  const otherActions = [{
    icon: Calendar,
    label: "Add Event",
    onClick: () => setIsAddEventOpen(true),
    moduleTheme: 'calendar' as const
  }, {
    icon: AlertTriangle,
    label: "Add Safety Update",
    onClick: () => setIsSafetyUpdateOpen(true),
    moduleTheme: 'safety' as const
  }];

  /**
   * ActionColumn component for displaying a column of actions with a header
   * This helps organize actions by their module type
   */
  const ActionColumn = ({
    title,
    actions,
    moduleType
  }: {
    title: string;
    actions: Array<{
      icon: any;
      label: string;
      onClick: () => void;
      moduleTheme: "goods" | "skills" | "calendar" | "safety";
    }>;
    moduleType: "goods" | "skills" | "calendar" | "safety";
  }) => <div className="flex flex-col gap-2">
      {/* Column heading with colored accent - using primary (fully saturated) color for border */}
      <h3 className="text-sm font-semibold mb-2 pb-1 border-b-2" style={{
      borderColor: moduleThemeColors[moduleType].primary
    }}>
        {title}
      </h3>
      
      {/* Actions in this column with enhanced styling but less saturated colors */}
      <div className="space-y-3">
        {actions.map(action => <ModuleButton key={action.label} moduleTheme={action.moduleTheme} variant="pastel" // Keeping pastel variant for buttons
      className="w-full justify-start shadow-sm hover:shadow-md transition-all duration-200 transform hover:translate-y-[-2px]" onClick={action.onClick}>
            <action.icon className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">{action.label}</span>
          </ModuleButton>)}
      </div>
    </div>;
  
  return <div className="w-full">
      {/* Three-column grid for organized actions */}
      <div className="grid grid-cols-3 gap-6">
        <ActionColumn title="Freebies" actions={goodsActions} moduleType="goods" />
        <ActionColumn title="Skill Sharing" actions={skillsActions} moduleType="skills" />
        <ActionColumn title="Events & Updates" actions={otherActions} moduleType="calendar" />
      </div>

      {/* Dialog and Sheet components - now using the same panels as individual pages */}
      <AddEventDialog 
        open={isAddEventOpen} 
        onOpenChange={setIsAddEventOpen} 
        onAddEvent={() => {}} 
      />
      
      <AddSafetyUpdateDialogNew 
        open={isSafetyUpdateOpen} 
        onOpenChange={setIsSafetyUpdateOpen} 
      />
      
      {/* Goods Sheet - same as used on GoodsPage */}
      <Sheet open={isGoodsSheetOpen} onOpenChange={setIsGoodsSheetOpen}>
        <SheetContent 
          side="right" 
          className="w-[400px] sm:w-[540px] overflow-y-auto"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: moduleThemeColors.goods.primary + '40',
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px ${moduleThemeColors.goods.primary}10`
          }}
        >
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold">
              {initialRequestType === "offer" ? "Offer an Item" : "Request an Item"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <GoodsForm
              onClose={() => setIsGoodsSheetOpen(false)}
              initialRequestType={initialRequestType}
              mode="create"
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Skills Popover - same as used on SkillsPage */}
      <AddSkillPopover
        open={isSkillPopoverOpen}
        onOpenChange={setIsSkillPopoverOpen}
        onSkillAdded={() => {
          // Optional: Add any callback logic here
        }}
      />
    </div>;
};

export default QuickActions;
