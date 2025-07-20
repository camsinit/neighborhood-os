import { Calendar, HelpCircle, Heart, AlertTriangle, Package, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddEventDialog from "./AddEventDialog";
import SafetyUpdateForm from "./safety/SafetyUpdateForm";
import SkillsPageSelector from "./skills/SkillsPageSelector";
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
 * - Sharing or requesting skills - now using Sheet consistently
 * - Adding safety updates - now using Sheet consistently
 * 
 * All actions now use Sheet components for consistency across the app.
 */
const QuickActions = () => {
  const navigate = useNavigate();
  
  // State for controlling various sheets
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isSafetyUpdateOpen, setIsSafetyUpdateOpen] = useState(false);
  const [isGoodsSheetOpen, setIsGoodsSheetOpen] = useState(false);
  const [isSkillSheetOpen, setIsSkillSheetOpen] = useState(false);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);

  // Goods/Items actions (orange theme)
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

  // Skills actions (green theme) - now using Sheet
  const skillsActions = [{
    icon: Wrench,
    label: "Share a skill",
    onClick: () => {
      setIsSkillSheetOpen(true);
    },
    moduleTheme: 'skills' as const
  }, {
    icon: HelpCircle,
    label: "Request a skill",
    onClick: () => {
      setIsSkillSheetOpen(true);
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

  // Skill added handler - simple refresh without complex context dependencies
  const handleSkillAdded = () => {
    console.log('[QuickActions] Skill added successfully');
    // Keep sheet open so users can add more skills if they want
  };

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
      {/* Column heading with colored accent */}
      <h3 className="text-sm font-semibold mb-2 pb-1 border-b-2" style={{
      borderColor: moduleThemeColors[moduleType].primary
    }}>
        {title}
      </h3>
      
      {/* Actions in this column */}
      <div className="space-y-3">
        {actions.map(action => <ModuleButton key={action.label} moduleTheme={action.moduleTheme} variant="pastel" 
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

      {/* Event Dialog - keeping existing implementation */}
      <AddEventDialog 
        open={isAddEventOpen} 
        onOpenChange={setIsAddEventOpen} 
        onAddEvent={() => {}} 
      />
      
      {/* Safety Update Sheet - now using Sheet consistently */}
      <Sheet open={isSafetyUpdateOpen} onOpenChange={setIsSafetyUpdateOpen}>
        <SheetContent 
          side="right" 
          className="w-[400px] sm:w-[540px] overflow-y-auto"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: moduleThemeColors.safety.primary + '40',
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px ${moduleThemeColors.safety.primary}10`
          }}
        >
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold">
              Share Safety Update
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <SafetyUpdateForm onSuccess={() => setIsSafetyUpdateOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
      
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
      
      {/* Skills Sheet - now using Sheet consistently */}
      <Sheet open={isSkillSheetOpen} onOpenChange={setIsSkillSheetOpen}>
        <SheetContent 
          side="right" 
          className="w-[400px] sm:w-[540px] overflow-y-auto"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: moduleThemeColors.skills.primary + '40',
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px ${moduleThemeColors.skills.primary}10`
          }}
        >
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold">
              Add Skills to Share
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <SkillsPageSelector 
              onSkillAdded={handleSkillAdded} 
              multiCategoryMode={true}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>;
};

export default QuickActions;
