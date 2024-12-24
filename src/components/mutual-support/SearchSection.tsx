import SearchBar from "./SearchBar";
import CategoryFilters from "./CategoryFilters";

interface SearchSectionProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const SearchSection = ({ selectedCategory, onCategorySelect }: SearchSectionProps) => {
  return (
    <div className="flex items-center gap-6 mb-8">
      <SearchBar />
      <CategoryFilters 
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
      />
    </div>
  );
};

export default SearchSection;