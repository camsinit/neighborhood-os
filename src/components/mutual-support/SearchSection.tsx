
import SearchBar from "./SearchBar";
import { ViewType } from "./types";
import { Button } from "@/components/ui/button";

interface SearchSectionProps {
  selectedView: ViewType;
  onViewSelect: (view: ViewType) => void;
  onSearch: (query: string) => void;
}

const SearchSection = ({ 
  selectedView,
  onViewSelect,
  onSearch,
}: SearchSectionProps) => {
  return (
    <div className="flex items-center gap-6 mb-8">
      <SearchBar onSearch={onSearch} />
      <div className="flex gap-2">
        <Button
          variant={selectedView === "skills" ? "default" : "outline"}
          onClick={() => onViewSelect(selectedView === "skills" ? null : "skills")}
          className="h-[36px]"
          size="sm"
        >
          Skills
        </Button>
        <Button
          variant={selectedView === "goods" ? "default" : "outline"}
          onClick={() => onViewSelect(selectedView === "goods" ? null : "goods")}
          className="h-[36px]"
          size="sm"
        >
          Goods
        </Button>
        <Button
          variant={selectedView === "care" ? "default" : "outline"}
          onClick={() => onViewSelect(selectedView === "care" ? null : "care")}
          className="h-[36px]"
          size="sm"
        >
          Care
        </Button>
      </div>
    </div>
  );
};

export default SearchSection;
