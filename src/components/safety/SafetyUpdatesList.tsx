
import { AlertTriangle, Bell, Wrench, Construction, Info, Search, ChevronDown, Filter } from "lucide-react";
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
  // Define categories for update filtering
  const categories = [{
    icon: Info,
    label: "All Updates",
    value: "all"
  }, {
    icon: AlertTriangle,
    label: "Emergency",
    value: "Emergency"
  }, {
    icon: Bell,
    label: "Alerts",
    value: "Alert"
  }, {
    icon: Construction,
    label: "Infrastructure",
    value: "Infrastructure"
  }, {
    icon: Wrench,
    label: "Maintenance",
    value: "Maintenance"
  }];

  // State for filtering and searching
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter updates based on category and search term
  const filteredUpdates = updates.filter(update => {
    // Apply category filter if not "all"
    const categoryMatch = selectedCategory.value === "all" || 
                        update.type === selectedCategory.value;
    
    // Apply search filter if search term exists
    const searchMatch = !searchTerm || 
                      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (update.description && update.description.toLowerCase().includes(searchTerm.toLowerCase()));
                      
    return categoryMatch && searchMatch;
  });

  /**
   * Render skeleton loading state
   * Creates placeholder cards while data is loading
   */
  const renderSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" /> 
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-3 rounded-md" />
              <Skeleton className="h-4 w-full mb-2 rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
          </div>
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
      <Info className="h-12 w-12 mx-auto mb-4 text-blue-500 opacity-50" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">No updates found</h3>
      <p className="text-gray-600 mb-6">
        {searchTerm || selectedCategory.value !== "all" 
          ? "Try adjusting your search or filter criteria." 
          : "Be the first to share important information with your neighborhood."}
      </p>
      <Button 
        onClick={onAddUpdate}
        className="mx-auto"
      >
        Post an Update
      </Button>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 px-0 py-0">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            type="search" 
            placeholder="Search updates..." 
            className="pl-10 pr-4 py-2 w-full bg-white border-gray-200 focus:ring-blue-200 focus:border-blue-300 h-10 rounded-md" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Category filter dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-600 border-gray-200 bg-white rounded-md w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2 opacity-70" />
              {selectedCategory.label}
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white rounded-md">
            {categories.map(category => (
              <DropdownMenuItem 
                key={category.value} 
                onClick={() => setSelectedCategory(category)} 
                className="cursor-pointer rounded-md"
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          onClick={onAddUpdate} 
          className="bg-blue-500 hover:bg-blue-600 text-white ml-auto w-full sm:w-auto rounded-md"
        >
          <Info className="w-4 h-4 mr-2" />
          Post Update
        </Button>
      </div>
      <div className="space-y-6">
        {isLoading ? (
          renderSkeleton()
        ) : filteredUpdates?.length > 0 ? (
          filteredUpdates.map(update => (
            <SafetyUpdateCard 
              key={update.id} 
              update={update} 
              onClick={() => onUpdateClick(update)} 
            />
          ))
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};

export default SafetyUpdatesList;
