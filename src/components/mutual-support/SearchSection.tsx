import SearchBar from "./SearchBar";
import CategoryFilters from "./CategoryFilters";

interface SearchSectionProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  onSearch: (query: string) => void;
  selectedView: "time-sensitive" | "ongoing" | null;
  onViewSelect: (view: "time-sensitive" | "ongoing" | null) => void;
}

const SearchSection = ({ 
  selectedCategory, 
  onCategorySelect, 
  onSearch,
  selectedView,
  onViewSelect
}: SearchSectionProps) => {
  return (
    <div className="flex items-center gap-6 mb-8">
      <SearchBar onSearch={onSearch} />
      <CategoryFilters 
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
        selectedView={selectedView}
        onViewSelect={onViewSelect}
      />
    </div>
  );
};

export default SearchSection;