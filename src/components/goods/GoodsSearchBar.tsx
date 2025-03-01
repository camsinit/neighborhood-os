
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

/**
 * Component for the search bar and filtering options in the Goods page
 * 
 * Includes search input and category filtering
 */
interface GoodsSearchBarProps {
  searchTerm: string;  // Current search term
  onSearchChange: (value: string) => void;  // Handler for search changes
  categoryFilter: string | null;  // Currently selected category filter
  onCategoryChange: (category: string | null) => void;  // Handler for category changes
}

const GoodsSearchBar = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
}: GoodsSearchBarProps) => {
  // Categories for goods items
  const categories = [
    { value: "furniture", label: "Furniture" },
    { value: "tools", label: "Tools" },
    { value: "electronics", label: "Electronics" },
    { value: "kitchen", label: "Kitchen" },
    { value: "clothing", label: "Clothing" },
    { value: "books", label: "Books" },
    { value: "toys", label: "Toys" },
    { value: "sports", label: "Sports" },
    { value: "garden", label: "Garden" },
    { value: "produce", label: "Produce" },
    { value: "household", label: "Household" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
      {/* Search input with icon */}
      <div className="relative w-full sm:w-[280px]">
        <Input
          type="text"
          placeholder="Search goods..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {/* Category filter */}
      <div className="w-full sm:w-auto">
        <Select
          value={categoryFilter || ""}
          onValueChange={(value) => onCategoryChange(value === "" ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default GoodsSearchBar;
