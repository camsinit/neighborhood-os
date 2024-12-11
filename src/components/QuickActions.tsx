import { Calendar, HelpCircle, Heart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const QuickActions = () => {
  const actions = [
    { icon: Calendar, label: "Add Event", onClick: () => {} },
    { icon: HelpCircle, label: "Ask for Help", onClick: () => {} },
    { icon: Heart, label: "Share an Offer", onClick: () => {} },
    { icon: AlertTriangle, label: "Safety Update", onClick: () => {} },
  ];

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="flex flex-col items-center justify-center h-24 p-4 hover:bg-muted"
            onClick={action.onClick}
          >
            <action.icon className="h-6 w-6 mb-2" />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;