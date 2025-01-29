import { Bell, Clock, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import SafetyUpdateCard from "./SafetyUpdateCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SafetyUpdatesListProps {
  updates: any[];
  isLoading: boolean;
  onUpdateClick: (update: any) => void;
}

const SafetyUpdatesList = ({ updates, isLoading, onUpdateClick }: SafetyUpdatesListProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = [
    { icon: Clock, label: "update", displayLabel: "Updates" },
    { icon: Bell, label: "alert", displayLabel: "Alerts" },
    { icon: Wrench, label: "maintenance", displayLabel: "Maintenance" },
  ];

  const filteredUpdates = updates.filter(update => {
    if (!selectedCategory) return true;
    return update.type.toLowerCase() === selectedCategory.toLowerCase();
  });

  const renderSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4">
          <Skeleton className="h-12 w-12" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Search updates..."
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <Button 
              key={cat.label} 
              variant="outline" 
              className={`flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200 h-10 ${
                selectedCategory === cat.label ? 'bg-gray-100 border-gray-300' : ''
              }`}
              onClick={() => setSelectedCategory(
                selectedCategory === cat.label ? null : cat.label
              )}
            >
              <cat.icon className="h-4 w-4" />
              {cat.displayLabel}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          renderSkeleton()
        ) : (
          filteredUpdates?.map((update) => (
            <SafetyUpdateCard
              key={update.id}
              update={update}
              onClick={() => onUpdateClick(update)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SafetyUpdatesList;