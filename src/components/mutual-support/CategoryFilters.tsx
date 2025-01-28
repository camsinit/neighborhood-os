import { Button } from "@/components/ui/button";
import { Package, Car, Wrench, Share2, Filter, ChevronDown } from "lucide-react";
import { Category } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories: Category[] = [
  { icon: Package, label: "Goods" },
  { icon: Car, label: "Transportation" },
  { icon: Wrench, label: "Skills" },
  { icon: Share2, label: "Resources" },
];

interface CategoryFiltersProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  selectedView: "time-sensitive" | "ongoing" | null;
  onViewSelect: (view: "time-sensitive" | "ongoing" | null) => void;
}

const CategoryFilters = ({ 
  selectedCategory, 
  onCategorySelect,
  selectedView,
  onViewSelect,
}: CategoryFiltersProps) => {
  return (
    <div className="flex gap-4 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`flex items-center gap-2 ${selectedCategory ? 'bg-gray-100' : ''}`}
          >
            <Filter className="h-4 w-4" />
            {selectedCategory ? categories.find(c => c.label.toLowerCase() === selectedCategory)?.label : 'Categories'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {categories.map((cat) => (
            <DropdownMenuItem
              key={cat.label}
              onClick={() => onCategorySelect(selectedCategory === cat.label.toLowerCase() ? null : cat.label.toLowerCase())}
              className="flex items-center gap-2"
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex gap-2">
        <Button
          variant={selectedView === "time-sensitive" ? "default" : "outline"}
          onClick={() => onViewSelect(selectedView === "time-sensitive" ? null : "time-sensitive")}
          className="h-[36px]"
        >
          Immediate
        </Button>
        <Button
          variant={selectedView === "ongoing" ? "default" : "outline"}
          onClick={() => onViewSelect(selectedView === "ongoing" ? null : "ongoing")}
          className="h-[36px]"
        >
          Ongoing
        </Button>
      </div>
    </div>
  );
};

export default CategoryFilters;