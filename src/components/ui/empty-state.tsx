
import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  className?: string;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}: EmptyStateProps) => {
  return (
    <div className={`max-w-4xl mx-auto mt-8 ${className}`}>
      <Button 
        variant="outline" 
        onClick={onAction} 
        className="w-full p-8 h-auto border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center gap-4"
      >
        <Icon className="h-8 w-8 text-gray-400" />
        <div className="flex flex-col items-center text-center">
          <p className="text-lg font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </Button>
    </div>
  );
};

export default EmptyState;
