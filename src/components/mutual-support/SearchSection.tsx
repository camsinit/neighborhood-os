import SearchBar from "./SearchBar";
import CategoryFilters from "./CategoryFilters";

const SearchSection = () => {
  return (
    <div className="flex items-center gap-6 mb-8">
      <SearchBar />
      <CategoryFilters />
    </div>
  );
};

export default SearchSection;