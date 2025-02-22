
import { Clock, Bell, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SafetyUpdateCard from "./SafetyUpdateCard";
import { Skeleton } from "@/components/ui/skeleton";

interface SafetyUpdatesListProps {
  updates: any[];
  isLoading: boolean;
  onUpdateClick: (update: any) => void;
}

const SafetyUpdatesList = ({
  updates,
  isLoading,
  onUpdateClick
}: SafetyUpdatesListProps) => {
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

  const renderSkeleton = () => <div className="space-y-6">
      {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>)}
    </div>;

  return <div>
      <div className="flex items-center gap-6 mb-6 px-0 py-0">
        <Input type="search" placeholder="Search safety updates..." className="max-w-sm bg-white border-gray-200 focus:ring-amber-200 focus:border-amber-300 h-10" />
        <div className="flex gap-4 px-0 mx-[3px]">
          {categories.map(cat => <Button 
              key={cat.label} 
              variant="outline" 
              className="flex items-center gap-2 bg-[#FDE1D3] hover:bg-[#FDE1D3]/90 text-gray-900 border-transparent h-10"
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </Button>)}
        </div>
      </div>
      <div className="space-y-6">
        {isLoading ? renderSkeleton() : updates?.map(update => <SafetyUpdateCard key={update.id} update={update} onClick={() => onUpdateClick(update)} />)}
      </div>
    </div>;
};

export default SafetyUpdatesList;
