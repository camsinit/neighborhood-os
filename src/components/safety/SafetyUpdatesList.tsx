
import { Clock, Bell, Wrench, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SafetyUpdateCard from "./SafetyUpdateCard";
import { Skeleton } from "@/components/ui/skeleton";

interface SafetyUpdatesListProps {
  updates: any[];
  isLoading: boolean;
  onUpdateClick: (update: any) => void;
  onAddUpdate: () => void;
}

const SafetyUpdatesList = ({
  updates,
  isLoading,
  onUpdateClick,
  onAddUpdate
}: SafetyUpdatesListProps) => {
  // Define categories for safety updates filtering (used in category buttons)
  const categories = [{
    icon: Clock,
    label: "Updates"
  }, {
    icon: Bell,
    label: "Alerts"
  }, {
    icon: Wrench,
    label: "Maintenance"
  }];

  /**
   * Render skeleton loading state
   * Creates placeholder cards while data is loading
   */
  const renderSkeleton = () => <div className="space-y-6">
      {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>)}
    </div>;

  /**
   * Render empty state when no updates exist
   * Shows a message and a button to create the first update
   */
  const renderEmptyState = () => (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <Shield className="h-12 w-12 mx-auto mb-4 text-red-500 opacity-50" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">No safety updates</h3>
      <p className="text-gray-600 mb-6">Be the first to share important safety information with your neighborhood.</p>
      <Button 
        onClick={onAddUpdate}
        className="bg-red-500 hover:bg-red-600 text-white"
      >
        <Shield className="w-4 h-4 mr-2" />
        New Update
      </Button>
    </div>
  );

  return <div>
      <div className="flex items-center gap-4 mb-6 px-0 py-0">
        <Input 
          type="search" 
          placeholder="Search safety updates..." 
          className="max-w-sm bg-white border-gray-200 focus:ring-amber-200 focus:border-amber-300 h-10" 
        />
        <Button 
          onClick={onAddUpdate}
          className="bg-red-500 hover:bg-red-600 text-white ml-auto"
        >
          <Shield className="w-4 h-4 mr-2" />
          New Update
        </Button>
        {/* Fixed: This section was causing the void[] error because map() wasn't returning anything */}
        <div className="flex gap-4 px-0 mx-[3px]">
          {categories.map((cat, index) => (
            <Button 
              key={index}
              variant="outline" 
              size="sm"
              className="text-gray-600 border-gray-200"
            >
              <cat.icon className="w-4 h-4 mr-2" />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        {isLoading ? renderSkeleton() : (
          updates?.length > 0 ? (
            updates.map(update => (
              <SafetyUpdateCard 
                key={update.id} 
                update={update} 
                onClick={() => onUpdateClick(update)} 
              />
            ))
          ) : (
            renderEmptyState()
          )
        )}
      </div>
    </div>;
};

export default SafetyUpdatesList;
