import { Button } from "@/components/ui/button";
import { Package, Car, Wrench, Share2 } from "lucide-react";
import { Category } from "./types";

const categories: Category[] = [
  { icon: Package, label: "Goods" },
  { icon: Car, label: "Transportation" },
  { icon: Wrench, label: "Skills" },
  { icon: Share2, label: "Resources" },
];

const CategoryFilters = () => {
  return (
    <div className="flex gap-4">
      {categories.map((cat) => (
        <Button 
          key={cat.label} 
          variant="outline" 
          className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200"
        >
          <cat.icon className="h-4 w-4" />
          {cat.label}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilters;