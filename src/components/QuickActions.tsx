
import { Calendar, HelpCircle, Heart, AlertTriangle, Package, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SafetyUpdateForm from "./safety/SafetyUpdateForm";
import SkillsSidePanelSelector from "./skills/SkillsSidePanelSelector";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import GoodsForm from "./goods/GoodsForm";
import ModuleButton from "./ui/module-button";
import { moduleThemeColors } from "@/theme/moduleTheme";
import EventForm from "./events/EventForm";
import { SkillsProvider } from "@/contexts/SkillsContext";
import { useNeighborhood } from "@/contexts/neighborhood";
import { supabase } from "@/integrations/supabase/client";

/**
 * QuickActions component displays common actions for users to interact with the community.
 * 
 * This includes:
 * - Adding events - NOW using Sheet pattern for consistency
 * - Sharing or requesting items (goods) - using proper goods forms
 * - Sharing or requesting skills - NOW wrapped in SkillsProvider to fix context error
 * - Adding safety updates - using Sheet consistently
 * 
 * All actions now use Sheet components for complete consistency across the app.
 */
const QuickActions = () => {
  const navigate = useNavigate();
  const { currentNeighborhood } = useNeighborhood();
  
  // State for controlling various sheets
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isSafetyUpdateOpen, setIsSafetyUpdateOpen] = useState(false);
  const [isGoodsSheetOpen, setIsGoodsSheetOpen] = useState(false);
  const [isSkillSheetOpen, setIsSkillSheetOpen] = useState(false);
  const [initialRequestType, setInitialRequestType] = useState<"need" | "offer" | null>(null);
  
  // Event-specific state for neighborhood timezone
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>('America/Los_Angeles');

  // Fetch neighborhood timezone when event sheet opens
  useEffect(() => {
    const fetchNeighborhoodTimezone = async () => {
      if (currentNeighborhood?.id) {
        console.log('[QuickActions] Fetching timezone for neighborhood:', currentNeighborhood.id);
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('timezone')
          .eq('id', currentNeighborhood.id)
          .single();
          
        if (data && !error) {
          setNeighborhoodTimezone(data.timezone || 'America/Los_Angeles');
          console.log(`[QuickActions] Using timezone: ${data.timezone || 'America/Los_Angeles'}`);
        } else {
          console.warn('[QuickActions] Could not fetch neighborhood timezone, using default');
        }
      }
    };
    
    // Only fetch when event sheet is opened
    if (isAddEventOpen && currentNeighborhood) {
      fetchNeighborhoodTimezone();
    }
  }, [isAddEventOpen, currentNeighborhood]);

  // Goods/Items actions (orange theme)
  const goodsActions = [{
    icon: Package,
    label: "Share an item",
    onClick: () => {
      console.log('[QuickActions] Opening goods sheet for sharing');
      setInitialRequestType("offer");
      setIsGoodsSheetOpen(true);
    },
    moduleTheme: 'goods' as const
  }, {
    icon: Package,
    label: "Request an item",
    onClick: () => {
      console.log('[QuickActions] Opening goods sheet for requesting');
      setInitialRequestType("need");
      setIsGoodsSheetOpen(true);
    },
    moduleTheme: 'goods' as const
  }];

  // Skills actions (green theme) - now using Sheet with SkillsProvider
  const skillsActions = [{
    icon: Wrench,
    label: "Share a skill",
    onClick: () => {
      console.log('[QuickActions] Opening skills sheet for sharing');
      setIsSkillSheetOpen(true);
    },
    moduleTheme: 'skills' as const
  }, {
    icon: HelpCircle,
    label: "Request a skill",
    onClick: () => {
      console.log('[QuickActions] Opening skills sheet for requesting');
      setIsSkillSheetOpen(true);
    },
    moduleTheme: 'skills' as const
  }];

  // Events & Safety actions (blue and red themes) - now both using Sheet
  const otherActions = [{
    icon: Calendar,
    label: "Add Event",
    onClick: () => {
      console.log('[QuickActions] Opening event sheet');
      setIsAddEventOpen(true);
    },
    moduleTheme: 'calendar' as const
  }, {
    icon: AlertTriangle,
    label: "Add Safety Update",
    onClick: () => {
      console.log('[QuickActions] Opening safety update sheet');
      setIsSafetyUpdateOpen(true);
    },
    moduleTheme: 'safety' as const
  }];

  // Event added handler with proper cleanup
  const handleEventAdded = () => {
    console.log('[QuickActions] Event added successfully');
    setIsAddEventOpen(false);
  };

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

      {/* Event Sheet - Clean white background with blue accent */}
      <Sheet open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <SheetContent 
          side="right" 
          className="w-[400px] sm:w-[540px] overflow-y-auto bg-white border-l-4"
          style={{
            borderLeftColor: moduleThemeColors.calendar.primary
          }}
        >
          <SheetHeader className="border-b border-border/40 pb-4">
            <SheetTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5" style={{ color: moduleThemeColors.calendar.primary }} />
              Add New Event
            </SheetTitle>
            <div className="text-sm text-muted-foreground">
              All times are in {neighborhoodTimezone.replace('_', ' ')} timezone
            </div>
          </SheetHeader>
          <div className="mt-6">
            <EventForm 
              onClose={() => setIsAddEventOpen(false)}
              onAddEvent={handleEventAdded}
              neighborhoodTimezone={neighborhoodTimezone}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Safety Update Sheet - Clean white background with red accent */}
      <Sheet open={isSafetyUpdateOpen} onOpenChange={setIsSafetyUpdateOpen}>
        <SheetContent 
          side="right" 
          className="w-[400px] sm:w-[540px] overflow-y-auto bg-white border-l-4"
          style={{
            borderLeftColor: moduleThemeColors.safety.primary
          }}
        >
          <SheetHeader className="border-b border-border/40 pb-4">
            <SheetTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" style={{ color: moduleThemeColors.safety.primary }} />
              Share Safety Update
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <SafetyUpdateForm onSuccess={() => setIsSafetyUpdateOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Goods Sheet - Clean white background with orange accent */}
      <Sheet open={isGoodsSheetOpen} onOpenChange={setIsGoodsSheetOpen}>
        <SheetContent 
          side="right" 
          className="w-[400px] sm:w-[540px] overflow-y-auto bg-white border-l-4"
          style={{
            borderLeftColor: moduleThemeColors.goods.primary
          }}
        >
          <SheetHeader className="border-b border-border/40 pb-4">
            <SheetTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: moduleThemeColors.goods.primary }} />
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
      
      {/* Skills Sheet - Clean white background with green accent */}
      <Sheet open={isSkillSheetOpen} onOpenChange={setIsSkillSheetOpen}>
        <SheetContent 
          side="right" 
          className="w-[400px] sm:w-[540px] overflow-y-auto bg-white border-l-4"
          style={{
            borderLeftColor: moduleThemeColors.skills.primary
          }}
        >
          <SheetHeader className="border-b border-border/40 pb-4">
            <SheetTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Wrench className="h-5 w-5" style={{ color: moduleThemeColors.skills.primary }} />
              Add Skills to Share
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {/* ENHANCED: Use new SkillsSidePanelSelector optimized for side panels */}
            <SkillsProvider>
              <SkillsSidePanelSelector 
                onSkillAdded={handleSkillAdded} 
                multiCategoryMode={true}
                onClose={() => setIsSkillSheetOpen(false)}
              />
            </SkillsProvider>
          </div>
        </SheetContent>
      </Sheet>
    </div>;
};

export default QuickActions;
