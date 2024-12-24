import { Button } from "@/components/ui/button";
import { Package, Car, Wrench, Share2 } from "lucide-react";
import { Category } from "./types";

const categories: Category[] = [
  { icon: Package, label: "Goods" },
  { icon: Car, label: "Transportation" },
  { icon: Wrench, label: "Skills" },
  { icon: Share2, label: "Resources" },
];

interface CategoryFiltersProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const CategoryFilters = ({ selectedCategory, onCategorySelect }: CategoryFiltersProps) => {
  return (
    <div className="flex gap-4">
      {categories.map((cat) => (
        <Button 
          key={cat.label} 
          variant={selectedCategory === cat.label ? "default" : "outline"}
          className="flex items-center gap-2 hover:bg-accent/50 border-gray-200"
          onClick={() => onCategorySelect(selectedCategory === cat.label ? null : cat.label)}
        >
          <cat.icon className="h-4 w-4" />
          {cat.label}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilters;