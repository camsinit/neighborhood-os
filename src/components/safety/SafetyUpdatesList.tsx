
import { Clock, Bell, Wrench, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SafetyUpdateCard from "./SafetyUpdateCard";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";

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
  // Define categories for safety updates filtering
  const categories = [{
    icon: Clock,
    label: "All Updates",
    value: "all"
  }, {
    icon: Bell,
    label: "Alerts",
    value: "alert"
  }, {
    icon: Wrench,
    label: "Maintenance",
    value: "maintenance"
  }];

  // State to track the selected category
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  /**
   * Render skeleton loading state
   * Creates placeholder cards while data is loading
   */
  const renderSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );

  /**
   * Render empty state when no updates exist
   * Shows a message and a button to create the first update
   */
  const renderEmptyState = () => (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <Shield className="h-12 w-12 mx-auto mb-4 text-red-500 opacity-50" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">No safety updates</h3>
      <p className="text-gray-600 mb-6">Be the first to share important safety information with your neighborhood.</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 px-0 py-0">
        <Input 
          type="search" 
          placeholder="Search safety updates..." 
          className="max-w-sm bg-white border-gray-200 focus:ring-amber-200 focus:border-amber-300 h-10" 
        />
        
        {/* Category filter dropdown menu - now with consistent height */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="text-gray-600 border-gray-200 bg-white h-10"
            >
              <selectedCategory.icon className="w-4 h-4 mr-2" />
              {selectedCategory.label}
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            {categories.map(category => (
              <DropdownMenuItem 
                key={category.value} 
                onClick={() => setSelectedCategory(category)} 
                className="cursor-pointer"
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          onClick={onAddUpdate} 
          className="bg-red-500 hover:bg-red-600 text-white ml-auto h-10"
        >
          <Shield className="w-4 h-4 mr-2" />
          New Update
        </Button>
      </div>
      
      <div className="space-y-6">
        {isLoading ? 
          renderSkeleton() : 
          updates?.length > 0 ? 
            updates.map(update => (
              <SafetyUpdateCard 
                key={update.id} 
                update={update} 
                onClick={() => onUpdateClick(update)} 
              />
            )) : 
            renderEmptyState()
        }
      </div>
    </div>
  );
};

export default SafetyUpdatesList;
