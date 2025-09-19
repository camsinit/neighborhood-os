
import { Calendar, HelpCircle, Users, Wrench, Zap, UsersRound, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SkillRequestSheet from "./skills/SkillRequestSheet";
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AppSheetContent } from "@/components/ui/app-sheet-content";
import ModuleButton from "./ui/module-button";
import { moduleThemeColors } from "@/theme/moduleTheme";
import EventForm from "./events/EventForm";
import { SkillsProvider } from "@/contexts/SkillsContext";
import { useNeighborhood } from "@/contexts/neighborhood";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";
import { neighborhoodPath, BASE_ROUTES } from "@/utils/routes";
import SkillsSidePanelSelector from "./skills/SkillsSidePanelSelector";

// Logger for this component
const logger = createLogger('QuickActions');

/**
 * QuickActions component displays essential actions for community engagement.
 * 
 * Focused on core features:
 * - Calendar/Events - Adding events and viewing calendar
 * - Skills - Sharing and requesting skills  
 * - Groups - Creating groups and finding neighbors
 * 
 * All actions use Sheet components for consistent UX across the app.
 */
const QuickActions = () => {
  const navigate = useNavigate();
  const { currentNeighborhood } = useNeighborhood();
  
  // State for controlling various sheets
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isSkillSheetOpen, setIsSkillSheetOpen] = useState(false);
  const [isSkillRequestSheetOpen, setIsSkillRequestSheetOpen] = useState(false);
  
  // Event-specific state for neighborhood timezone
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>('America/Los_Angeles');

  // Fetch neighborhood timezone when event sheet opens
  useEffect(() => {
    const fetchNeighborhoodTimezone = async () => {
      if (currentNeighborhood?.id) {
        logger.info('Fetching timezone for neighborhood', { neighborhoodId: currentNeighborhood.id });
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('timezone')
          .eq('id', currentNeighborhood.id)
          .single();
          
        if (data && !error) {
          setNeighborhoodTimezone(data.timezone || 'America/Los_Angeles');
          logger.info('Using timezone', { timezone: data.timezone || 'America/Los_Angeles' });
        } else {
          logger.warn('Could not fetch neighborhood timezone, using default');
        }
      }
    };
    
    // Only fetch when event sheet is opened
    if (isAddEventOpen && currentNeighborhood) {
      fetchNeighborhoodTimezone();
    }
  }, [isAddEventOpen, currentNeighborhood]);

  // Calendar/Events actions (blue theme)
  const calendarActions = [{
    icon: Calendar,
    label: "Add Event",
    onClick: () => {
      logger.info('Opening event sheet');
      setIsAddEventOpen(true);
    },
    moduleTheme: 'calendar' as const
  }, {
    icon: Calendar,
    label: "View Calendar", 
    onClick: () => {
      const calendarPath = neighborhoodPath(BASE_ROUTES.calendar, currentNeighborhood?.id);
      navigate(calendarPath);
    },
    moduleTheme: 'calendar' as const
  }];

  // Skills actions (green theme) - keeping the core skills functionality
  const skillsActions = [{
    icon: Wrench,
    label: "Share a skill",
    onClick: () => {
      logger.info('Opening skills sheet for sharing');
      setIsSkillSheetOpen(true);
    },
    moduleTheme: 'skills' as const
  }, {
    icon: HelpCircle,
    label: "Request a skill",
    onClick: () => {
      logger.info('Opening skill request sheet');
      setIsSkillRequestSheetOpen(true);
    },
    moduleTheme: 'skills' as const
  }];

  // Groups & Community actions (purple theme) - new focus on social connection
  const groupsActions = [{
    icon: UsersRound,
    label: "Join a Group",
    onClick: () => {
      const groupsPath = neighborhoodPath(BASE_ROUTES.neighbors, currentNeighborhood?.id);
      navigate(groupsPath);
    },
    moduleTheme: 'neighbors' as const
  }, {
    icon: UserPlus,
    label: "Find a Neighbor",
    onClick: () => {
      const neighborsPath = neighborhoodPath(BASE_ROUTES.neighbors, currentNeighborhood?.id);
      navigate(neighborsPath);
    },
    moduleTheme: 'neighbors' as const
  }];

  // Event added handler with proper cleanup
  const handleEventAdded = () => {
    logger.info('Event added successfully');
    setIsAddEventOpen(false);
  };

  // Skill added handler - simple refresh without complex context dependencies
  const handleSkillAdded = () => {
    logger.info('Skill added successfully');
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
      moduleTheme: "calendar" | "skills" | "neighbors";
    }>;
    moduleType: "calendar" | "skills" | "neighbors";
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
      {/* Quick Actions heading */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Zap className="h-6 w-6" />
        Quick Actions
      </h2>
      
      {/* Three-column grid focused on core community features */}
      <div className="grid grid-cols-3 gap-6">
        <ActionColumn title="Calendar & Events" actions={calendarActions} moduleType="calendar" />
        <ActionColumn title="Skills & Learning" actions={skillsActions} moduleType="skills" />
        <ActionColumn title="Groups & Community" actions={groupsActions} moduleType="neighbors" />
      </div>

      {/* Event Sheet - Clean white background with blue accent */}
      <Sheet open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <AppSheetContent 
          side="right" 
          moduleTheme="calendar"
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
        </AppSheetContent>
      </Sheet>
      
      {/* Skills Sheet - Clean white background with green accent */}
      <Sheet open={isSkillSheetOpen} onOpenChange={setIsSkillSheetOpen}>
        <AppSheetContent 
          side="right" 
          moduleTheme="skills"
        >
          <SheetHeader className="border-b border-border/40 pb-4">
            <SheetTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Wrench className="h-5 w-5" style={{ color: moduleThemeColors.skills.primary }} />
              Add Skills to Share
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {/* Use SkillsSidePanelSelector optimized for side panels */}
            <SkillsProvider>
              <SkillsSidePanelSelector 
                onSkillAdded={handleSkillAdded} 
                multiCategoryMode={true}
                onClose={() => setIsSkillSheetOpen(false)}
              />
            </SkillsProvider>
          </div>
        </AppSheetContent>
      </Sheet>
      
      {/* Skill Request Sheet - Uses the same SkillRequestSheet component from Skills page */}
      <SkillRequestSheet 
        open={isSkillRequestSheetOpen}
        onOpenChange={setIsSkillRequestSheetOpen}
      />
    </div>;
};

export default QuickActions;
